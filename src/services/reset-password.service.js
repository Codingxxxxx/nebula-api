const { ResetPasswordModel } = require('../models');

/**
 * get a reset password record by token
 * @param {string} token 
 * @return {Promise}
 */
function getByToken(token) {
  return ResetPasswordModel.findOne({ token }).lean();
}

/**
 * create a reset password record
 * @param {string} userId 
 * @param {string} token 
 * @param {Date} expirationDate 
 * @return {Promise}
 */
function create(userId, token, expirationDate) {
  return ResetPasswordModel.create({
    userId,
    token,
    expirationDate
  });  
}

/**
 * delete a reset password record
 * @param {string} id 
 * @return
 */
function deleteRecord(id) {
  return ResetPasswordModel.findByIdAndDelete(id).lean();
}

module.exports = {
  create,
  getByToken,
  deleteRecord
};