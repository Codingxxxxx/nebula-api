const { Logger } = require('./../utils');
const { v4 } = require('uuid');
const { AppConfig } = require('../const');

/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
module.exports = async (req, res, next) => {
  try {
    const requestBody = { ...req.body };
    
    const blackListKey = [
      'accessToken',
      'refreshToken',
      'password',
      'username'
    ];

    // remove some sensitive data
    if (AppConfig.NODE_ENV !== 'development') blackListKey.forEach(key => {
      delete requestBody[key];
    });

    const requestId = v4();

    const requestMetadata = {
      method: req.method.toUpperCase(),
      endpoint: req.url,
      contentType: req.headers['content-type'],
      requestId
    };

    res.locals =  {  ...(res.locals || {}), requestId, requestMetadata };

    Logger.log('info', JSON.stringify(requestBody || req.files || {}), requestMetadata);
    next();
  } catch (error) {
    next(error);
  }
};