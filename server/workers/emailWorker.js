require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const connectDB = require('../config/database');
const { connectRedis } = require('../config/redis');
const emailService = require('../services/emailService');
const EmailLog = require('../models/client/EmailLog');
const logger = require('../utils/logger');

const processEmailJob = async (job) => {
  const { emailData } = job.data;

  try {
    logger.info('Processing: ' + emailData.messageId);

    await EmailLog.updateOne(
      { messageId: emailData.messageId },
      { $set: { status: 'processing' } }
    );

    const result = await emailService.sendEmail(emailData);

    await EmailLog.updateOne(
      { messageId: emailData.messageId },
      {
        $set: {
          status: result.status,
          'deliveryDetails.deliveredAt': new Date(),
        },
      }
    );

    logger.info('Sent: ' + emailData.messageId);
    return result;

  } catch (error) {
    logger.error('Failed: ' + emailData.messageId + ' - ' + error.message);

    const currentLog = await EmailLog.findOne({ messageId: emailData.messageId });
    if (currentLog) {
      const attempts = (currentLog.deliveryDetails?.attempts || 0) + 1;

      await EmailLog.updateOne(
        { messageId: emailData.messageId },
        {
          $set: {
            status: job.attemptsMade >= 4 ? 'failed' : 'deferred',
            'deliveryDetails.attempts': attempts,
            'deliveryDetails.lastAttempt': new Date(),
            'deliveryDetails.smtpResponse': error.message,
          },
        }
      );
    }

    throw error;
  }
};

const startWorker = async () => {
  try {
    await connectDB();
    await connectRedis();
    await emailService.initTransporter();

    const Queue = require('bull');
    const emailQueue = new Queue('email-sending', process.env.REDIS_URL, {
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: 500,
      },
    });

    emailQueue.process('send-email', processEmailJob);

    emailQueue.on('completed', (job) => {
      logger.info('Completed: ' + job.data.emailData.messageId);
    });

    emailQueue.on('failed', (job, err) => {
      logger.error('Job failed: ' + err.message);
    });

    console.log('📨 Email Worker Started - Waiting for jobs...');

  } catch (error) {
    console.error('Worker start failed:', error.message);
    process.exit(1);
  }
};

process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));

startWorker();