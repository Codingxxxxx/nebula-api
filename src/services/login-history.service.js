const { LoginHistoryModel } = require('./../models');

/**
 * Create login log
 * @param {string} userId 
 * @param {string} ipv4 
 * @param {string} os 
 * @param {string} browser 
 * @returns 
 */
function create(userId, ipv4, os, browser) {
  return LoginHistoryModel.create({
    userId,
    ipv4,
    os,
    browser
  });
}

module.exports = {
  create
};