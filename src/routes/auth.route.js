const router = require('express').Router();
const { ApiCode } = require('../const').Api;
const { UserStatus } = require('../const').DB;
const { Validator, Auth, Logger, Mail, UAParser, BunnyCDN, Redis } = require('./../utils');
const { UserService, EmailVerificationService, LoginHistoryService } = require('./../services');
const { render } = require('nunjucks');
const { AppConfig } = require('../const');
const moment = require('moment');
const { createHash } = require('crypto');

router.post('/users', async (req, res, next) => {
  try {
    if (!Validator.validateSignup(req.body)) return res.status(400).json({
      code: ApiCode.VALIDATION_ERROR,
      data: {
        errors: Validator.validateSignup.errors
      }
    });

    const { username, password, email } = req.body;

    // validate if username is taken
    if (await UserService.getUserByUsername(username.trim())) return res.status(400).json({
      keyword: ApiCode.USER_NAME_TAKEN
    });

    // check if email is taken
    if (await UserService.getUserByEmail(email.trim())) return res.status(400).json({
      keyword: ApiCode.USER_EMAIL_TAKEN
    });

    // hash plain password
    const [derivedPassword, salt] = await Auth.hashPassword(password);

    // insert to db
    const createdUser = await UserService.createUser({
      username: username.trim(),
      password: derivedPassword,
      passwordSalt: salt,
      email: email.trim()
    });
    
    // create verification token
    const { token } = await EmailVerificationService.create({
      userId: createdUser._id, 
      token: await Auth.generateVerificationToken(),
      expirationDate: moment().add('15', 'minutes') // life time of token, it will expire in the next 15 minutes
    });

    // send verification email
    new Promise((resolve, reject) => {
      render('pages/account-verification.html', {
        $page: {
          username: createdUser.username,
          email: createdUser.email,
          verificationUrl: `${AppConfig.CLIENT_VERIFY_URL}?token=${token}`,
          appName: AppConfig.APP_NAME
        }
      }, (error, html) => {
        if (error) return reject(error);
        resolve(html);
      });
    })
      .then(html => {
        // send mail
        return Mail.sendMail('', 'Account verification', html, 'hc2.minea@gmail.com');
      })
      .then(() => {
        Logger.info('Mail has sent successfully', res.locals.requestMetaData);
      })
      .catch(error => {
        Logger.error(JSON.stringify(error), res.requestMetaData);
      });

    const payload = { userId: createdUser._id, username: createdUser.username };
    // generate access token
    const [accessToken, refreshToken] = await Promise.all([
      Auth.generateJWTToken(payload, AppConfig.JWT_SECRET, AppConfig.JWT_TOKEN_EXPIRE),
      Auth.generateJWTToken(payload, AppConfig.JWT_REFRESH_TOKEN_SECRET, AppConfig.JWT_REFRESH_TOKEN_EXPIRE)
    ]);

    res.status(201).json({
      data: {
        user: {
          _id: createdUser._id,
          username: createdUser.username,
          email: createdUser.email,
          status: createdUser.status,
          isVerified: createdUser.isVerified
        },
        auth: {
          accessToken,
          refreshToken
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/verify', async (req, res, next) => {
  try {
    if (!Validator.validateVerification(req.query)) return res.status(400).json({
      keyword: ApiCode.VALIDATION_ERROR,
      data: {
        errors: Validator.validateVerification.errors
      }
    });

    const { token } = req.query;

    // check if token is valid
    const verificationRecord = await EmailVerificationService.getByToken(token.trim());

    // token invalid if it is not found in db
    if (!verificationRecord) return res.status(400).json({
      keyword: ApiCode.VERIFICATION_TOKEN_INVALID
    });

    if ( moment(verificationRecord.expirationDate).isBefore(moment())) return res.status(400).json({
      keyword: ApiCode.VERiFICATION_TOKEN_EXPIRED
    });
    

    // update user record to verified
    await UserService.updateUserVerificationStatus(verificationRecord.userId, true);
    await EmailVerificationService.deleteRecord(verificationRecord._id);

    res.status(204).send();

  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    if (!Validator.validateSignin(req.body)) return res.status(400).json({
      keyword: ApiCode.VALIDATION_ERROR,
      data: {
        errors: Validator.validateSignin.errors
      }
    });

    const { username, password } = req.body;

    // get user
    const user = await UserService.getUserByUsername(username.trim());
    
    if (!user) return res.status(400).json({
      keyword: ApiCode.LOGIN_INVALID_CREDENTIAL
    });

    // user is banned
    if (user.status === UserStatus.SUSPENDED) return res.status(400).json({
      keyword: ApiCode.USER_NAME_TAKEN
    });

    // compare password
    const [derivedPassword] = await Auth.hashPassword(password, user.passwordSalt);

    if (derivedPassword !== user.password) return res.status(400).json({
      keyword: ApiCode.LOGIN_INVALID_CREDENTIAL
    });

    // create login history
    const uaHeader = req.headers['user-agent'];
    await LoginHistoryService.create(user._id, req.ip, UAParser.getOS(uaHeader), UAParser.getBrowser(uaHeader));

    // create jwt token
    const payload = {
      userId: user._id,
      username: user.username
    };
    
    const [accessToken, refreshToken] = await Promise.all([
      Auth.generateJWTToken(payload, AppConfig.JWT_SECRET, AppConfig.JWT_TOKEN_EXPIRE),
      Auth.generateJWTToken(payload, AppConfig.JWT_REFRESH_TOKEN_SECRET, AppConfig.JWT_REFRESH_TOKEN_EXPIRE)
    ]);
    
    res.status(200).json({
      data: {
        auth: {
          accessToken,
          refreshToken 
        },
        user: {
          username: user.username,
          profileUrl: user.avatar && BunnyCDN.generateAvatarUrl(user._id, user.avatar.sourceUrl),
          isVerified: user.isVerified,
          email: user.email,
          creationDate: user.creationDate,
          status: user.status
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/revoke', async (req, res, next) => {
  try {
    if (!Validator.validateRevokeToken(req.body)) return res.status(400).send();
    
    const { refreshToken, accessToken } = req.body;

    // verify refresh token and access token, but ignore expiration for access token because it supposes to expired
    // catch promises and return null because by default this promise function 
    // will throw exception, so we don't want that, just return null if token is invalid
    const [accessTokenPayload, refreshTokenPayload] = await Promise.all([
      Auth.verifyJWT(Auth.loadTokenFromHex(accessToken), AppConfig.JWT_SECRET, { ignoreExpiration: false }).catch(() => null),
      Auth.verifyJWT(Auth.loadTokenFromHex(refreshToken), AppConfig.JWT_REFRESH_TOKEN_SECRET).catch(() => null),
    ]);
    
    if (!accessTokenPayload && !refreshTokenPayload) return res.status(401).send();

    // check if refresh token is in blacklist
    if (await Redis.get(createHash('sha1').update(refreshToken).digest('hex'))) return res.status(401).send();

    const newPayload = {
      userId: refreshTokenPayload.userId,
      username: refreshTokenPayload.username
    };
    
    // generate new access token and refresh token
    const [newAccessToken, newRefreshToken] = await Promise.all([
      Auth.generateJWTToken(newPayload, AppConfig.JWT_SECRET, AppConfig.JWT_TOKEN_EXPIRE),
      Auth.generateJWTToken(newPayload , AppConfig.JWT_REFRESH_TOKEN_SECRET, AppConfig.JWT_REFRESH_TOKEN_EXPIRE)
    ]);

    // cache the old tokens to prevent users from using
    await Promise.all([
      Redis.set(createHash('sha1').update(accessToken).digest('hex'), accessToken, {
        PX: accessToken.exp,
        NX: true
      }),
      Redis.set(createHash('sha1').update(refreshToken).digest('hex'), refreshToken, {
        PX: refreshToken.exp,
        NX: true
      })
    ]);
    
    res.status(200).json({
      data: {
        auth: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// logout
router.post('/logout', async (req, res, next) => {
  try {
    if (!Validator.validateLogout(req.body)) return res.status(401).send();

    const { accessToken, refreshToken } = req.body;

    // verify refresh token and access token, but ignore expiration for access token because it supposes to expired
    // catch promises and return null because by default this promise function 
    // will throw exception, so we don't want that, just return null if token is invalid
    const [accessTokenPayload, refreshTokenPayload] = await Promise.all([
      Auth.verifyJWT(Auth.loadTokenFromHex(accessToken), AppConfig.JWT_SECRET, { ignoreExpiration: false }).catch(() => null),
      Auth.verifyJWT(Auth.loadTokenFromHex(refreshToken), AppConfig.JWT_REFRESH_TOKEN_SECRET).catch(() => null),
    ]);
    
    if (!accessTokenPayload && !refreshTokenPayload) return res.status(401).send();

    // check if refresh token is in blacklist
    if (await Redis.get(createHash('sha1').update(refreshToken).digest('hex'))) return res.status(401).send();

    // cache the old tokens to prevent users from using
    await Promise.all([
      Redis.set(createHash('sha1').update(accessToken).digest('hex'), accessToken, {
        PX: accessToken.exp,
        NX: true
      }),
      Redis.set(createHash('sha1').update(refreshToken).digest('hex'), refreshToken, {
        PX: refreshToken.exp,
        NX: true
      })
    ]);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;