console.dir(require('dotenv').config().parsed);
const { AppConfig } = require('./const');
const { ServerLogger, Redis } = require('./utils');
const express = require('express');
const nunjucks = require('nunjucks');
const { default: mongoose } = require('mongoose');
const fileUpload = require('express-fileupload');
const cors = require('cors');

const app = express();

// setup trust proxy
app.enable('trust proxy');
app.disable('x-powered-by');

nunjucks.configure('views', {
  noCache: AppConfig.NODE_ENV === 'development',
  throwOnUndefined: AppConfig.NODE_ENV === 'development',
  watch: AppConfig.NODE_ENV === 'development'
});

nunjucks.installJinjaCompat();

app.use(express.urlencoded({
  extended: true
}));

app.use(express.json());

// setup cors
app.use(cors({
  optionsSuccessStatus: 200,
  origin: (AppConfig.ALLOWED_HOST || '').split(',').map(origin => origin.trim()), //
  methods: 'GET,POST,PUT,DELETE',
  maxAge: 600, // cache for 10 minutes
  credentials: false,
  preflightContinue: false
}));

app.use(fileUpload());

app.use(require('./middlewares/log.middleware'));

// register routes
app.use('/api/v1/', require('./routes'));

// error 5.x.x handler
app.use(require('./middlewares/error-handler.middleware'));

mongoose.connection.on('open', () => {
  ServerLogger.info('Connecting to mongodb');
});

mongoose.connection.on('connected', () => {
  ServerLogger.info('Connected to mongodb');
});

mongoose.connection.on('disconnected', () => {
  ServerLogger.error('Disconnected from mongodb');
});

mongoose.connection.on('reconnect', () => {   
  ServerLogger.warn('Reconnecting to mongodb');
});

mongoose.connection.on('error', () => {
  ServerLogger.error('Failed to establish connection to mongodb');
});

// redis events
Redis.on('connect', () => {
  ServerLogger.info('Connecting to Redis...');
});

Redis.on('ready', () => {
  ServerLogger.info('Connected to Redis');
});

Redis.on('error', (error) => {
  ServerLogger.error('Failed to connect to Redis', error);
});

Redis.on('end', () => {
  ServerLogger.error('Redis connection has been closed');
});

Redis.on('reconnecting', () => {
  ServerLogger.warning('Redis connection is reconnecting...');
});

mongoose.connect(AppConfig.MONGO_URI)
  .then(() => Redis.connect())
  .then(() => {
    app.listen(AppConfig.PORT, AppConfig.HOST, () => {
      console.info('Sever started');
    });
  })
  .catch((error) => ServerLogger.error('Failed to start the app', error));

