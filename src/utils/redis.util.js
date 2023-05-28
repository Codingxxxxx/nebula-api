const redis = require('redis');
const ServerLogger = require('./server-logger.util');
const { AppConfig } = require('../const');
const client = redis.createClient({
  url: AppConfig.REDIS_URL
});

client.on('connect', () => {
  ServerLogger.info('Connecting to redis server...');
});

client.on('ready', () => {
  ServerLogger.info('Connected to redis server');
});

client.on('end', () => {
  ServerLogger.warn('Connection has been closed');
});

client.on('error', (err) => {
  console.log(err);
  ServerLogger.error('Unable to connect to redis server');
});

client.on('reconnecting', () => {
  ServerLogger.warn('Reconnecting to redis server');
});

/**
 * connect to redis servre
 * @returns {Promise}
 */
function connect() {
  return client.connect();
}

/**
 * disconnect from redis server
 * @returns {Promies<void>}
 */
function disconnect() {
  return client.disconnect();
}

/**
 * Get value by key
 * @param {string} key 
 * @returns {Promise}
 */
function get(key) {
  return client.get(key);
}

/**
 * 
 * @param {string} key 
 * @param {string} value 
 * @param {import('redis').SetOptions} [options] 
 * @returns {Promise}
 */
function set(key, value, options={}) {
  return client.set(key, value, options);
}

/**
 * Redis events listener
 * connect, no args, initiating a connection to the server
 * ready, no args, client is ready to use	
 * end, no args, connection has been closed (via .quit() or .disconnect())
 * error, args Error, an error has occurred—usually a network issue such as "Socket closed unexpectedly
 * reconnecting, no args, client is trying to reconnect to the server	
 * @param {keyof { connect, ready, end, error, reconnecting }} eventName
 * @param {function(...args):void} listener
 * @return {import('redis').RedisClientType}
 */
function on(eventName, listener) {
  return client.on(eventName, listener);
}

module.exports = {
  connect,
  disconnect,
  get,
  set,
  on
};