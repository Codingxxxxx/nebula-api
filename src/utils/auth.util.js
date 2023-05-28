const { createHash, randomBytes, pbkdf2 } = require('crypto');
const { AppConfig } = require('../const');
const jwt = require('jsonwebtoken');

/**
 * Hash plain password using pbkdf2 algorithms
 * @param {string} rawPassword Plain password
 * @param {string} [salt] Password salt 
 * @returns {Promise<[string, string]>}
 */
function hashPassword(rawPassword, salt) {
  return new Promise((resolve, reject) => {
    salt = salt || createHash('sha256').update(randomBytes(32)).digest('hex');
    pbkdf2(
      Buffer.from(rawPassword), 
      Buffer.from(salt), 
      Number(AppConfig.AUTH_PBKDF2_ITERATION), 
      Number(AppConfig.AUTH_PBKDF2_KEYLEN), 
      AppConfig.AUTH_PBKDF2_DIGEST, (error, key) => {
        if (error) return reject(error);
        resolve([key.toString('hex'), salt]);
      });
  });
}

/**
 * Generate a long random token string
 * @returns {Promise<string>}
 */
function generateVerificationToken() {
  return new Promise((resolve, reject) => {
    randomBytes(64, (error, buf) => {
      if (error) return reject(error);
      resolve(createHash('sha512').update(Buffer.from(buf.toString('hex') + Date.now())).digest('hex'));
    });
  });
}

/**
 * Create a JWT token
 * @param {*} payload data to sign
 * @param {*} secret secret key
 * @param {string} expiresIn expressed in seconds or a string describing a time span zeit/ms. Eg: 60, "2 days", "10h", "7d"
 */
function generateJWTToken(payload, secret, expiresIn) {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, secret, {
      algorithm: 'HS256',
      issuer: AppConfig.NEBULA_API_DOMAIN,
      audience: AppConfig.CLIENT_DOMAIN,
      expiresIn: expiresIn || null
    }, (error, token) => {
      if (error) return reject(error);
      resolve(Buffer.from(token).toString('hex'));
    });
  });
}

/**
 * verify jwt token
 * @param {string} token 
 * @param {string} secret 
 * @param {import('jsonwebtoken').VerifyOptions} options 
 * @return {Promise<any>}
 */
function verifyJWT(token, secret, options={}) {
  return new Promise((resolve, reject) => {

    /** @type {import('jsonwebtoken').VerifyOptions} */
    const defaultOptions = {
      algorithms: 'HS256',
      issuer: AppConfig.NEBULA_API_DOMAIN,
      audience: AppConfig.CLIENT_DOMAIN
    };
  
    jwt.verify(token, secret, { ...defaultOptions, ...options }, (error, payload) => {
      if (error) return reject(error);
      resolve(payload);
    });
  });
}

/**
 * Load JWT token from hex string
 * @param {string} token JWT token
 * @return {string}
 */
function loadTokenFromHex(token) {
  return Buffer.from(token, 'hex').toString();
}

module.exports = {
  hashPassword,
  generateVerificationToken,
  generateJWTToken,
  verifyJWT,
  loadTokenFromHex
};