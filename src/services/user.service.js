const { UserModel } = require('./../models');
const { Types } = require('mongoose');

/**
 * get all user avatars
 * @param {string} userId 
 * @return {Promise}
 */
function getAvatars(userId) {
  return UserModel.findOne({
    _id: userId
  }, {
    _id: 0,
    avatars: 1
  }).lean();
}

/**
 * get a user by id
 * @param {string} userId 
 * @return {Promise}
 */
function getUserById(userId) {
  return UserModel.findById(userId).lean();
}

/**
 * Create a user
 * @param {Object} user 
 * @param {string} user.username
 * @param {string} user.password
 * @param {string} user.passwordSalt
 * @param {string} user.email
 * @returns 
 */
function createUser(user) {
  return UserModel.create({
    username: user.username,
    password: user.password,
    email: user.email,
    passwordSalt: user.passwordSalt
  });
}

/**
 * Find a user by username
 * @param {string} username 
 * @returns 
 */
async function getUserByUsername(username) {
  return UserModel.findOne({
    username
  }, {
    _id: 1,
    username: 1,
    password: 1,
    passwordSalt: 1,
    isVerified: 1,
    status: 1,
    email: 1,
    avatar: {
      $arrayElemAt: [
        {
          $filter: {
            input: '$avatars',
            as: 'elem',
            cond: {
              $eq: ['$selectedAvatar', '$$elem._id']
            }
          }
        },
        0
      ]
    },
    creationDate: 1
  }).lean();
}

/**
 * get a user by email
 * @param {string} email a valid email
 * @return {Promise}
 */
function getUserByEmail(email) {
  return UserModel.findOne({ email }).lean();
}

/**
 * Update user verification status
 * @param {string} userId 
 * @param {boolean} isVerified 
 */
function updateUserVerificationStatus(userId, isVerified) {
  return UserModel.findByIdAndUpdate(userId, { isVerified }).lean();
}

/**
 * 
 * @param {string} userId 
 * @param {keyof AvatarTypes} avatarType 
 * @param {string} filename 
 * @param {string} mimetype 
 * @param {string} size 
 * @param {string} sourceUrl 
 * @return {Promise}
 */
async function updateAvatar(userId, avatarType, filename, mimetype, size, sourceUrl) {
  const _id = new Types.ObjectId();
  await UserModel.findOneAndUpdate({ _id: userId }, {
    $push: {
      avatars: {
        _id,
        type: avatarType,
        filename,
        mimetype,
        size,
        sourceUrl
      }
    },
    selectedAvatar: _id
  }).lean();

  return { 
    _id,
    filename
  };
}

/**
 * update password
 * @param {string} userId 
 * @param {string} password 
 * @param {string} salt 
 * @return {Promise}
 */
function updatePassword(userId, password, salt) {
  return UserModel.findByIdAndUpdate(userId, {
    password,
    passwordSalt: salt
  }).lean();
}

module.exports = {
  createUser,
  getUserByUsername,
  getAvatars,
  getUserById,
  getUserByEmail,
  updateUserVerificationStatus,
  updateAvatar,
  updatePassword
};