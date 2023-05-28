const nodemailer = require('nodemailer');
const { AppConfig } = require('../const');

const transport = nodemailer.createTransport({
  host: AppConfig.SMTP_HOST,
  auth: {
    user: AppConfig.SMTP_USER,
    pass: AppConfig.SMTP_PASS
  },
  port: Number(AppConfig.SMTP_PORT),
  secure: Number(AppConfig.PORT) === 465
});

/**
 * Send email
 * @param {string} from sender
 * @param {string} subject 
 * @param {string} html 
 * @param {string} receivers Receiver emails separate by comma, eg. 123@gmail.com, dd@mailinator.com...
 * @returns 
 */
function sendMail(from, subject, html, receivers) {
  return new Promise((resolve, reject) => [
    transport.sendMail({
      subject,
      html,
      to: receivers
    }, (error, msgInfo) => {
      if (error) return reject(error);
      resolve(msgInfo);
    })
  ]);
}

module.exports = {
  sendMail
};