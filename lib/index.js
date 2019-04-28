const queue = require('./queue');
const redis = require('./redis');

module.exports = {
  QUEUE: queue,
  REDIS: redis
};
