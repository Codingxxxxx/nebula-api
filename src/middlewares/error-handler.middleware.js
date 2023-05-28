const { AppConfig } = require('../const');
const { Logger } = require('../utils');

/**
 * Middleware that handle error 500
 * In development, default error handler is used because it's simpler to debug the code
 * @param {import('express').ErrorRequestHandler} error 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
module.exports = async (error, req, res, next) => {
  try {
    // use built-in error handler provided by express framework
    if (AppConfig.NODE_ENV === 'development') return next(error);

    const requestMetadata = {
      method: req.method.toUpperCase(),
      contentType: req.headers['content-type'],
      url: req.url,
      requestId: res.locals.requestId
    };

    // log error
    Logger.error(JSON.stringify(error), requestMetadata);

    if (req.xhr) return res.status(500).send('Server Error');
  } catch (error) {
    next(error);
  }
};