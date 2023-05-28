const { AppConfig } = require('../const');

/**
 * upload file to Bunny CDN
 * @param {import('express-fileupload').UploadedFile} file 
 * @param {string} filename 
 * @param {string} [dir] 
 * @return {Promise}
 */
function uploadFile(file, filename, dir='') {
  return fetch(`${AppConfig.BUNNY_CDN_HOST}/${AppConfig.BUNNY_CDN_STORAGE_ZONE}${dir || '/'}/${filename}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/octet-stream',
      'AccessKey': AppConfig.BUNNY_CDN_API_KEY
    },
    body: file.data
  });  
}

/**
 * generate cdn url for preview avatar file
 * @param {string} filename 
 * @return {String}
 */
function generateAvatarUrl(userId, filename) {
  return `${AppConfig.BUNNY_CDN_PUBLIC_HOST}/avatars/${userId}/${filename}`;
}

module.exports = {
  uploadFile,
  generateAvatarUrl
};