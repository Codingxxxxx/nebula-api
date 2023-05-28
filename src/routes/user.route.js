const router = require('express').Router();
const { ApiCode } = require('../const').Api;
const { Validator, BunnyCDN, Logger, Auth, Mail } = require('../utils');
const { checkAuth } = require('../middlewares');
const uuid = require('uuid');
const path = require('path');
const { UserService, ResetPasswordService } = require('../services');
const { render } = require('nunjucks');
const { AppConfig } = require('../const');
const moment = require('moment');

// add a avatar
router.post('/users/avatars/me', checkAuth, async (req, res, next) => {
  try {
    const file = req.files && req.files.avatarFile || {};
    
    const avatarFile = {
      filename: file.name,
      mimetype: file.mimetype,
      size: file.size
    };
    
    if (!Validator.validateUpdateAvatar({ avatarFile })) return res.status(400).json({
      keyword: ApiCode.VALIDATION_ERROR,
      data: {
        errors: Validator.validateUpdateAvatar.errors
      }
    });

    // this filename will appear on bunny cdn
    const filename = uuid.v4() + path.extname(avatarFile.filename);
    const bunnyAPIStatus = await BunnyCDN.uploadFile(file, filename, `/avatars/${res.locals.payload.userId}`).catch((error) => {
      Logger.error('Unable to upload file to CDN ', error);
      throw error;
    });
    
    if (bunnyAPIStatus.status !== 201) return;
    
    await UserService.updateAvatar(res.locals.payload.userId, 'FILE', file.name, file.mimetype, file.size, filename);
    
    res.status(200).json({
      data: {
        profileUrl: BunnyCDN.generateAvatarUrl(res.locals.payload.userId, filename)
      }
    });
  } catch (error) {
    next(error);
  }
});

// get a user avatar
router.get('/users/avatars/me', checkAuth, async (req, res, next) => {
  try {
    const { userId } = res.locals.payload;
    const { avatars } = await UserService.getAvatars(userId);

    return res.status(200).json({
      data: {
        avatars
      }
    });
  } catch (error) {
    next(error);
  }
});

// update password
router.put('/users/password/me', checkAuth, async (req, res, next) => {
  try {
    if (!Validator.validateUpdatePassword(req.body)) return res.status(400).json({
      keyword: ApiCode.VALIDATION_ERROR,
      data: {
        errors: Validator.validateUpdatePassword.errors
      }
    });
    const { currentPassword, newPassword } = req.body;
    
    const user = await UserService.getUserById(res.locals.payload.userId);

    const [derivedPassword] = await Auth.hashPassword(currentPassword, user.passwordSalt);
    
    // check if current password is correct
    if (derivedPassword !== user.password) return res.status(400).json({
      keyword: ApiCode.USER_CURRENT_PASSWORD_INVALID
    });

    const [newDerivedPassword, newSalt] = await Auth.hashPassword(newPassword);

    await UserService.updatePassword(res.locals.payload.userId, newDerivedPassword, newSalt);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// send email to user for resetting password
router.post('/users/password/reset/me', async (req, res, next) => {
  try {
    if (!Validator.validateResetPassword(req.body)) return res.status(400).json({
      keyword: ApiCode.VALIDATION_ERROR,
      data: {
        errors: Validator.validateResetPassword.errors
      }
    }); 

    const { email } = req.body;
    const user = await UserService.getUserByEmail(email.trim());

    if (!user) return res.status(400).json({
      keyword: ApiCode.USER_NOT_FOUND
    }); 

    const token = await Auth.generateVerificationToken();

    await ResetPasswordService.create(user._id, token, moment().add(15, 'minutes')); // expired in next 15 minutes
    
    const html = await new Promise((resolve, reject) => {
      render('pages/account-reset.html', {
        $page: {
          appName: AppConfig.APP_NAME,
          username: user.username,
          email,
          resetLink: `${AppConfig.CLIENT_RESET_PASSWORD_URL}?token=${token}`
        }
      }, (error, html) => {
        if (error) return reject(error);
        resolve(html);
      });
    });

    Mail.sendMail('', 'Reset Password', html, user.email.trim()).catch(error => {
      Logger.error('Unable to send mail', error);
      throw error;
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// verify reset password token from email
router.post('/users/password/reset/verify/me', async (req, res, next) => {
  try {
    const requestBody = { ...(req.body || {}), ...(req.query || {})};

    if (!Validator.validateVerifyResetPassword(requestBody)) return res.status(400).json({
      keyword: ApiCode.VALIDATION_ERROR,
      data: {
        errors: Validator.validateVerifyResetPassword.errors
      }
    });

    const { token, newPassword } = requestBody;
    // check if token exists
    const resetPasswordRecord = await ResetPasswordService.getByToken(token);

    if (!resetPasswordRecord) return res.status(400).json({
      keyword: ApiCode.VERIFICATION_TOKEN_INVALID
    });

    // check if token is not expired
    const now = moment();
    const expirationDate = moment(resetPasswordRecord.expirationDate);

    if (expirationDate.isBefore(now))  return res.status(400).json({
      keyword: ApiCode.VERiFICATION_TOKEN_EXPIRED
    });

    // update password
    const [derivedPassword, salt] = await Auth.hashPassword(newPassword);
    await UserService.updatePassword(resetPasswordRecord.userId, derivedPassword, salt);

    // remove token from record
    await ResetPasswordService.deleteRecord(resetPasswordRecord._id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;