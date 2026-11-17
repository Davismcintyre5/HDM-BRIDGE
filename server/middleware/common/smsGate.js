const SystemSetting = require('../../models/admin/SystemSetting');
const { AppError } = require('./errorHandler');
const { getRedisClient } = require('../../config/redis');
const logger = require('../../utils/logger');

const CACHE_KEY = 'setting:sms_enabled';
const CACHE_TTL = 60;

async function isSmsEnabled() {
  try {
    const redis = getRedisClient();
    const cached = await redis.get(CACHE_KEY);
    if (cached !== null) return cached === 'true';
  } catch {}

  const doc = await SystemSetting.findOne({ key: 'sms_enabled' }).lean();
  const enabled = doc ? doc.value === true : false;

  try {
    const redis = getRedisClient();
    await redis.set(CACHE_KEY, enabled ? 'true' : 'false', 'EX', CACHE_TTL);
  } catch {}

  return enabled;
}

async function invalidateSmsEnabledCache() {
  try {
    const redis = getRedisClient();
    await redis.del(CACHE_KEY);
  } catch (err) {
    logger.error('invalidateSmsEnabledCache failed: ' + err.message);
  }
}

async function smsGate(req, res, next) {
  try {
    if (!(await isSmsEnabled())) {
      return next(new AppError(
        'SMS service is temporarily disabled',
        503,
        'SMS_DISABLED'
      ));
    }
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { smsGate, isSmsEnabled, invalidateSmsEnabledCache };