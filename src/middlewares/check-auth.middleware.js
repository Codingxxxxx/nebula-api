const { Auth, Redis } = require('./../utils');
const { AppConfig } = require('./../const');
const { createHash } = require('crypto');

module.exports = async (req, res, next) => {
  try {
    const authHeader = (req.headers['authorization'] || '').replace('Bearer ', '');
    const accessToken = Buffer.from(authHeader, 'hex').toString();

    if (!authHeader) return res.status(401).send();
    
    // check in redis store
    if (await Redis.get(createHash('sha1').update(authHeader).digest('hex'))) return res.status(401).send(); 
    
    // verify token, return null is token is invalid
    const payload = await Auth.verifyJWT(accessToken, AppConfig.JWT_SECRET).catch(() => null);

    if (!payload) return res.status(401).send();
    
    res.locals = {  ...(res.locals || {}), payload };
    
    next();
  } catch (error) {
    next(error);
  }
};