const SystemSetting = require('../models/admin/SystemSetting');
const { getRedisClient } = require('../config/redis');
const logger = require('../utils/logger');

const CACHE_TTL = 60;
const PREFIX = 'setting:';
const KEYS = {
  rate: 'sms_rate_kes',
  minTopup: 'sms_min_topup_kes',
  lowBalance: 'sms_low_balance_kes',
  defaultSender: 'sms_default_sender',
};
const DEFAULTS = {
  rate: 1.0,
  minTopup: 10,
  lowBalance: 10,
  defaultSender: '',
};
const AT_COST_KES = 0.8;

async function readSetting(key, fallback) {
  const cacheKey = PREFIX + key;
  try {
    const redis = getRedisClient();
    const cached = await redis.get(cacheKey);
    if (cached !== null) {
      if (cached === '__empty__') return '';
      return isNaN(Number(cached)) ? cached : Number(cached);
    }
  } catch {}

  const doc = await SystemSetting.findOne({ key }).lean();
  const value = doc ? doc.value : fallback;

  try {
    const redis = getRedisClient();
    const str = value === '' || value === null || value === undefined ? '__empty__' : String(value);
    await redis.set(cacheKey, str, 'EX', CACHE_TTL);
  } catch {}

  return value;
}

async function getRate() {
  const v = await readSetting(KEYS.rate, DEFAULTS.rate);
  const n = Number(v);
  return isNaN(n) || n < 0 ? DEFAULTS.rate : n;
}

async function getMinTopup() {
  const v = await readSetting(KEYS.minTopup, DEFAULTS.minTopup);
  const n = Number(v);
  return isNaN(n) || n <= 0 ? DEFAULTS.minTopup : n;
}

async function getLowBalanceThreshold() {
  const v = await readSetting(KEYS.lowBalance, DEFAULTS.lowBalance);
  const n = Number(v);
  return isNaN(n) || n < 0 ? DEFAULTS.lowBalance : n;
}

async function getDefaultSender() {
  const v = await readSetting(KEYS.defaultSender, DEFAULTS.defaultSender);
  return typeof v === 'string' ? v.trim() : '';
}

async function invalidateCache(key) {
  try {
    const redis = getRedisClient();
    const fullKey = key ? PREFIX + key : null;
    if (fullKey) {
      await redis.del(fullKey);
      return;
    }
    await redis.del(
      PREFIX + KEYS.rate,
      PREFIX + KEYS.minTopup,
      PREFIX + KEYS.lowBalance,
      PREFIX + KEYS.defaultSender
    );
  } catch (err) {
    logger.error('smsPricingService.invalidateCache failed: ' + err.message);
  }
}

function getAtCostPerSms() {
  return AT_COST_KES;
}

module.exports = {
  getRate,
  getMinTopup,
  getLowBalanceThreshold,
  getDefaultSender,
  invalidateCache,
  getAtCostPerSms,
  KEYS,
  AT_COST_KES,
};