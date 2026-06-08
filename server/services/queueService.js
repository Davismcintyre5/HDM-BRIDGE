const Queue = require('bull');
const emailService = require('./emailService');
const logger = require('../utils/logger');

class QueueService {
  constructor() {
    this.emailQueue = null;
    this.initQueue();
  }

  initQueue() {
    this.emailQueue = new Queue('email-sending', process.env.REDIS_URL, {
      defaultJobOptions: {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 100,
        removeOnFail: 500,
        timeout: 30000,
      },
      limiter: {
        max: 100,
        duration: 5000,
      },
    });

    this.emailQueue.on('completed', (job) => {
      logger.info(`Job ${job.id} completed: ${job.data.messageId}`);
    });

    this.emailQueue.on('failed', (job, error) => {
      logger.error(`Job ${job.id} failed: ${error.message}`);
    });

    this.emailQueue.on('error', (error) => {
      logger.error(`Queue error: ${error.message}`);
    });

    this.emailQueue.process('send-email', async (job) => {
      return this.processEmailJob(job);
    });

    this.emailQueue.process('send-bulk-email', async (job) => {
      return this.processBulkEmailJob(job);
    });

    logger.info('✅ Email Queue Initialized');
  }

  async processEmailJob(job) {
    const { emailData } = job.data;
    return emailService.sendEmail(emailData);
  }

  async processBulkEmailJob(job) {
    const { emails } = job.data;
    const results = [];

    for (const email of emails) {
      const childJob = await this.emailQueue.add('send-email', {
        emailData: email,
      }, {
        priority: email.priority === 'high' ? 1 : 5,
      });
      results.push({ email: email.to, jobId: childJob.id });
    }

    return results;
  }

  async addToQueue(emailData, priority = 'normal') {
    const priorityMap = { low: 10, normal: 5, high: 1 };
    
    const job = await this.emailQueue.add(
      'send-email',
      { emailData },
      {
        priority: priorityMap[priority] || 5,
        jobId: emailData.messageId,
      }
    );

    return job;
  }

  async addBulkToQueue(emails) {
    const job = await this.emailQueue.add(
      'send-bulk-email',
      { emails },
      { priority: 3 }
    );

    return job;
  }

  async getJobStatus(jobId) {
    const job = await this.emailQueue.getJob(jobId);
    if (!job) return null;

    const state = await job.getState();
    const progress = job._progress;

    return {
      id: job.id,
      state,
      progress,
      attempts: job.attemptsMade,
      data: job.data,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
    };
  }

  async pauseQueue() {
    await this.emailQueue.pause();
    logger.info('📦 Email Queue Paused');
  }

  async resumeQueue() {
    await this.emailQueue.resume();
    logger.info('📦 Email Queue Resumed');
  }

  async getQueueStats() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.emailQueue.getWaitingCount(),
      this.emailQueue.getActiveCount(),
      this.emailQueue.getCompletedCount(),
      this.emailQueue.getFailedCount(),
      this.emailQueue.getDelayedCount(),
    ]);

    return { waiting, active, completed, failed, delayed };
  }

  async cleanQueue() {
    await this.emailQueue.clean(3600000, 'completed');
    await this.emailQueue.clean(86400000, 'failed');
    logger.info('🧹 Queue cleaned');
  }

  async closeQueue() {
    await this.emailQueue.close();
    logger.info('📦 Email Queue Closed');
  }
}

module.exports = new QueueService();