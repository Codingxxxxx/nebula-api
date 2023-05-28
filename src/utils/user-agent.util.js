const UA = require('ua-parser-js');

/**
 * User-Agent header
 * @param {string} ua 
 * @return {string}
 */
function getBrowser(ua) {
  const UAParser = new UA(ua).getResult();
  return `${UAParser.browser.name} ${UAParser.browser.version}`;
}

/**
 * User-Agent header
 * @param {string} ua 
 * @return {string}
 */
function getOS(ua) {
  const UAParser = new UA(ua).getResult();
  return `${UAParser.os.name} ${UAParser.os.version}`;
}

module.exports = {
  getBrowser,
  getOS
};