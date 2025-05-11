const Redis = require('ioredis');
const { REDIS_URL } = require('../config/env'); // REDIS_URL from .env

let redisClient;
// try {
//   redisClient = new Redis(REDIS_URL, {
//     tls: {}, // required for Upstash (enables SSL)
//   });

//   redisClient.on('ready', () => {
//     console.log('[Redis] Connected to Upstash Redis successfully');
//   });

//   redisClient.on('error', (err) => {
//     console.error('[Redis Error]', err.message || err);
//   });

// } catch (err) {
//   console.error('[Redis Init Error]', err.message || err);
// }

module.exports = redisClient;
