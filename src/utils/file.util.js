/**
 * number of bytes
 * @param {number} bytes 
 * @return {number}
 */
function convertByteToMB(bytes) {
  return bytes * 1048576;
}

/**
 * convert megabytes to bytes
 * @param {number} megabytes 
 * @return {number}
 */
function convertMBToByte(megabytes) {
  return megabytes * 1024 * 1024;
}

module.exports = {
  convertByteToMB,
  convertMBToByte
};