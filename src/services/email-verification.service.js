const { EmailVerificationModel } = require('./../models');

/**
 * @param {Object} emailVerification
 * @param {string} emailVerification.userId
 * @param {string} emailVerification.token,
 * @param {string} emailVerification.expirationDate
 * @return {Promise}
 */
function create(emailVerification) {
  return EmailVerificationModel.create({
    userId: emailVerification.userId,
    token: emailVerification.token,
    expirationDate: emailVerification.expirationDate
  });
}

/**
 * Get an email verification record by token
 * @param {string} token 
 * @return {Promise}
 */
function getByToken(token) {
  return EmailVerificationModel.findOne({ token }).lean();
}

/**
 * delete a verification email record
 * @param {string} id 
 * @return {Promise}
 */
function deleteRecord(id) {
  return EmailVerificationModel.findByIdAndDelete(id).lean();
}

module.exports = {
  create,
  getByToken,
  deleteRecord
};