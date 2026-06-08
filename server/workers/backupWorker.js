require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const connectDB = require('../config/database');
const backupService = require('../services/backupService');
const logger = require('../utils/logger');
const cron = require('node-cron');

const scheduledBackups = {
  daily: '0 2 * * *',      // 2 AM every day
  weekly: '0 3 * * 0',     // 3 AM every Sunday
  monthly: '0 4 1 * *',    // 4 AM first day of month
};

const startWorker = async () => {
  try {
    await connectDB();
    logger.info('🚀 Backup Worker Started');

    // Schedule daily backup
    cron.schedule(scheduledBackups.daily, async () => {
      logger.info('Starting daily backup...');
      try {
        await backupService.createBackup('database');
        logger.info('Daily backup completed');
      } catch (error) {
        logger.error('Daily backup failed:', error.message);
      }
    });

    // Schedule weekly full backup
    cron.schedule(scheduledBackups.weekly, async () => {
      logger.info('Starting weekly full backup...');
      try {
        await backupService.createBackup('full');
        logger.info('Weekly backup completed');
      } catch (error) {
        logger.error('Weekly backup failed:', error.message);
      }
    });

    // Schedule monthly archive backup
    cron.schedule(scheduledBackups.monthly, async () => {
      logger.info('Starting monthly archive backup...');
      try {
        await backupService.createBackup('full');
        logger.info('Monthly backup completed');
      } catch (error) {
        logger.error('Monthly backup failed:', error.message);
      }
    });

    logger.info('Backup schedules configured');
    logger.info(`  - Daily: ${scheduledBackups.daily}`);
    logger.info(`  - Weekly: ${scheduledBackups.weekly}`);
    logger.info(`  - Monthly: ${scheduledBackups.monthly}`);

  } catch (error) {
    logger.error('Failed to start backup worker:', error.message);
    process.exit(1);
  }
};

process.on('SIGTERM', () => {
  logger.info('Backup worker shutting down...');
  process.exit(0);
});

startWorker();