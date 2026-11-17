const SmsWallet = require('../models/client/SmsWallet');
const { getRedisClient } = require('../config/redis');
const logger = require('../utils/logger');

const CACHE_PREFIX = 'smswallet:';
const CACHE_TTL = 30;

function round2(n) {
  return Math.round(Number(n) * 100) / 100;
}

async function getOrCreate(organizationId) {
  const existing = await SmsWallet.findOne({ organizationId });
  if (existing) return existing;
  try {
    return await SmsWallet.create({
      organizationId,
      balance: 0,
      currency: 'KES',
    });
  } catch (err) {
    if (err.code === 11000) {
      return await SmsWallet.findOne({ organizationId });
    }
    throw err;
  }
}

async function getBalance(organizationId, { fresh = false } = {}) {
  const cacheKey = CACHE_PREFIX + organizationId;
  if (!fresh) {
    try {
      const redis = getRedisClient();
      const cached = await redis.get(cacheKey);
      if (cached !== null) return Number(cached) || 0;
    } catch {}
  }

  const wallet = await getOrCreate(organizationId);
  const balance = round2(wallet.balance || 0);

  try {
    const redis = getRedisClient();
    await redis.set(cacheKey, String(balance), 'EX', CACHE_TTL);
  } catch {}

  return balance;
}

async function invalidateCache(organizationId) {
  try {
    const redis = getRedisClient();
    await redis.del(CACHE_PREFIX + organizationId);
  } catch {}
}

async function credit(organizationId, amount, meta = {}) {
  const amt = round2(amount);
  if (!(amt > 0)) throw new Error('credit amount must be > 0');

  await getOrCreate(organizationId);

  const wallet = await SmsWallet.findOneAndUpdate(
    { organizationId },
    {
      $inc: { balance: amt, lifetimeToppedUp: amt },
      $set: {
        lastTopUpAt: new Date(),
        lastTopUpAmount: amt,
      },
    },
    { new: true }
  );

  await invalidateCache(organizationId);

  logger.info(
    'SMS wallet credit: org=' + organizationId +
    ' amount=' + amt +
    ' reason=' + (meta.reason || 'topup') +
    ' tx=' + (meta.transactionId || '—') +
    ' newBalance=' + wallet.balance
  );

  return {
    success: true,
    balance: round2(wallet.balance),
    currency: wallet.currency,
  };
}

async function debit(organizationId, amount) {
  const amt = round2(amount);
  if (!(amt > 0)) throw new Error('debit amount must be > 0');

  const wallet = await SmsWallet.findOneAndUpdate(
    { organizationId, balance: { $gte: amt } },
    {
      $inc: { balance: -amt, lifetimeSpent: amt },
    },
    { new: true }
  );

  if (!wallet) {
    const current = await SmsWallet.findOne({ organizationId }).lean();
    return {
      success: false,
      balance: round2(current?.balance || 0),
      currency: current?.currency || 'KES',
    };
  }

  await invalidateCache(organizationId);

  return {
    success: true,
    balance: round2(wallet.balance),
    currency: wallet.currency,
  };
}

module.exports = {
  getOrCreate,
  getBalance,
  credit,
  debit,
  invalidateCache,
};