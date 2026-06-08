const Redis = require('redis');

let redisClient = null;

const connectRedis = async () => {
  try {
    redisClient = Redis.createClient({
      url: process.env.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 20) {
            console.error('❌ Redis: Max retries reached. Exiting...');
            return new Error('Max retries reached');
          }
          return Math.min(retries * 100, 3000);
        },
      },
    });

    redisClient.on('error', (err) => {
      console.error(`❌ Redis Error: ${err.message}`);
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis Connected');
    });

    redisClient.on('reconnecting', () => {
      console.warn('⚠️  Redis Reconnecting...');
    });

    await redisClient.connect();
    return redisClient;

  } catch (error) {
    console.error(`❌ Redis Connection Failed: ${error.message}`);
    process.exit(1);
  }
};

const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
};

module.exports = { connectRedis, getRedisClient };