const winston = require('winston');
const { AppConfig } = require('../const');
const path = require('path');
require('winston-daily-rotate-file');


const transport = new winston.transports.DailyRotateFile({
  filename: 'nebula-api-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  dirname: path.join(__dirname, '../../logs/client')
});

const consoleTransport = new winston.transports.Console({
  format: winston.format.colorize({
    all: true,
    colors: {
      info: 'green',
      error: 'red',
      warning: 'yellow'
    }
  })
});

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'MMM-DD-YYYY HH:mm:ss A'
    }),
    winston.format.json({
      space: 2,
    })
  ),
  transports: [
    transport
  ]
});

if (AppConfig.NODE_ENV === 'development') logger.add(consoleTransport);

module.exports = logger;

