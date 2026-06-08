require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const connectDB = require('../config/database');
const { connectRedis, getRedisClient } = require('../config/redis');
const EmailLog = require('../models/client/EmailLog');
const AIChatSession = require('../models/client/AIChatSession');
const Plan = require('../models/client/Plan');
const Subscription = require('../models/client/Subscription');
const logger = require('../utils/logger');
const cron = require('node-cron');

const cleanupOldLogs = async () => {
  logger.info('Starting log cleanup...');

  try {
    // Get all plans with different retention periods
    const subscriptions = await Subscription.find({ status: 'active' }).populate('planId');
    
    for (const sub of subscriptions) {
      const retentionDays = sub.planId?.limits?.logRetentionDays || 7;
      const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

      const result = await EmailLog.deleteMany({
        organizationId: sub.organizationId,
        createdAt: { $lt: cutoffDate },
        status: { $in: ['sent', 'delivered', 'failed', 'bounced'] },
      });

      if (result.deletedCount > 0) {
        logger.info(`Cleaned ${result.deletedCount} logs for org ${sub.organizationId}`);
      }
    }

    logger.info('Log cleanup completed');
  } catch (error) {
    logger.error('Log cleanup failed:', error.message);
  }
};

const cleanupOldChats = async () => {
  logger.info('Starting chat cleanup...');

  try {
    const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const result = await AIChatSession.deleteMany({
      updatedAt: { $lt: cutoffDate },
      status: 'closed',
    });

    if (result.deletedCount > 0) {
      logger.info(`Cleaned ${result.deletedCount} old chat sessions`);
    }
  } catch (error) {
    logger.error('Chat cleanup failed:', error.message);
  }
};

const resetUsageCounters = async () => {
  logger.info('Resetting usage counters...');

  try {
    const redis = getRedisClient();
    const today = new Date().toISOString().split('T')[0];
    const month = today.substring(0, 7);

    // Reset daily counters
    const dailyKeys = await redis.keys(`usage:*:daily:*`);
    for (const key of dailyKeys) {
      const keyDate = key.split(':').pop();
      if (keyDate !== today) {
        await redis.del(key);
      }
    }

    // Reset monthly counters (keep current month)
    const monthlyKeys = await redis.keys(`usage:*:monthly:*`);
    for (const key of monthlyKeys) {
      const keyMonth = key.split(':').pop();
      if (keyMonth !== month) {
        await redis.del(key);
      }
    }

    logger.info('Usage counters reset completed');
  } catch (error) {
    logger.error('Usage counter reset failed:', error.message);
  }
};

const startWorker = async () => {
  try {
    await connectDB();
    await connectRedis();
    
    logger.info('🧹 Cleanup Worker Started');

    // Run cleanup every day at 1 AM
    cron.schedule('0 1 * * *', async () => {
      await cleanupOldLogs();
      await cleanupOldChats();
      await resetUsageCounters();
    });

    // Also run immediately on startup
    logger.info('Running initial cleanup...');
    await cleanupOldLogs();
    await cleanupOldChats();
    await resetUsageCounters();

    logger.info('Cleanup schedules configured');
    logger.info('  - Daily cleanup: 1:00 AM');

  } catch (error) {
    logger.error('Failed to start cleanup worker:', error.message);
    process.exit(1);
  }
};

process.on('SIGTERM', () => {
  logger.info('Cleanup worker shutting down...');
  process.exit(0);
});

startWorker();