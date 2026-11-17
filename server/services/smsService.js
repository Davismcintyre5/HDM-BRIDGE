const AfricasTalking = require('africastalking');
const SmsLog = require('../models/client/SmsLog');
const { AppError } = require('../middleware/common/errorHandler');
const smsWalletService = require('./smsWalletService');
const smsPricingService = require('./smsPricingService');
const adminNotifier = require('./adminNotifier');
const Organization = require('../models/client/Organization');
const logger = require('../utils/logger');

const AT = AfricasTalking({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME,
});
const sms = AT.SMS;

const AT_SUCCESS_CODES = new Set([100, 101, 102]);
const AT_ERROR_MAP = {
  401: { code: 'SMS_SEND_FAILED',         http: 502, message: 'SMS rejected by provider (risk hold)' },
  402: { code: 'SMS_SENDER_INVALID',      http: 502, message: 'SMS sender is not valid with the provider' },
  403: { code: 'SMS_RECIPIENT_INVALID',   http: 400, message: 'Invalid phone number' },
  404: { code: 'SMS_RECIPIENT_INVALID',   http: 400, message: 'Unsupported phone number type' },
  405: { code: 'SMS_PROVIDER_INSUFFICIENT_BALANCE', http: 502, message: 'SMS service temporarily unavailable' },
  406: { code: 'SMS_RECIPIENT_BLACKLISTED', http: 400, message: 'Recipient has opted out of receiving SMS' },
  407: { code: 'SMS_ROUTE_UNAVAILABLE',    http: 502, message: 'Cannot deliver to this number' },
  500: { code: 'SMS_SEND_FAILED',         http: 502, message: 'SMS provider error' },
  501: { code: 'SMS_SEND_FAILED',         http: 502, message: 'SMS provider gateway error' },
  502: { code: 'SMS_SEND_FAILED',         http: 502, message: 'SMS rejected by gateway' },
};

function generateMessageId() {
  return 'sms_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
}

function isConfigured() {
  return !!(process.env.AT_API_KEY && process.env.AT_USERNAME);
}

function computeUnits(content) {
  return Math.max(1, Math.ceil(String(content || '').length / 160));
}

function truncate(str, n) {
  const s = String(str || '');
  return s.length > n ? s.slice(0, n) + '…' : s;
}

async function alertAdminProviderDry({ organizationId, to, content }) {
  try {
    const org = await Organization.findById(organizationId).select('name').lean();
    await adminNotifier.notifyAdmins('adminSmsProviderDry', {
      orgName: org?.name || 'N/A',
      orgId: String(organizationId || ''),
      attemptedTo: to,
      contentPreview: truncate(content, 80),
      atUsername: process.env.AT_USERNAME || '',
      occurredAt: new Date(),
    }, { priority: 'high', organizationId });
  } catch (err) {
    logger.error('alertAdminProviderDry failed: ' + err.message);
  }
}

async function sendSms(smsData) {
  const {
    organizationId,
    userId,
    to,
    content,
    sender,
    type = 'transactional',
  } = smsData;

  if (!isConfigured()) {
    throw new AppError(
      'SMS service is not configured',
      503,
      'SMS_NOT_CONFIGURED'
    );
  }

  if (!to || !String(to).trim()) {
    throw new AppError('Recipient is required', 400, 'VALIDATION_001');
  }
  if (!content || !String(content).trim()) {
    throw new AppError('Message content is required', 400, 'VALIDATION_001');
  }

  const normalizedTo = String(to).trim();
  if (!/^\+\d{10,15}$/.test(normalizedTo)) {
    throw new AppError(
      'Phone number must be in E.164 format (e.g. +254712345678)',
      400,
      'SMS_RECIPIENT_INVALID'
    );
  }

  const rate = await smsPricingService.getRate();
  const atCost = smsPricingService.getAtCostPerSms();
  const units = computeUnits(content);
  const costKes = Math.round(units * rate * 100) / 100;
  const atCostKes = Math.round(units * atCost * 100) / 100;

  const balanceBefore = await smsWalletService.getBalance(organizationId, { fresh: true });

  if (balanceBefore < costKes) {
    throw new AppError(
      'Insufficient SMS balance. Need KSh ' + costKes.toFixed(2) +
        ', have KSh ' + balanceBefore.toFixed(2) + '.',
      402,
      'SMS_INSUFFICIENT_BALANCE'
    );
  }

  const messageId = generateMessageId();

  const options = {
    to: [normalizedTo],
    message: String(content),
  };
  if (sender && String(sender).trim()) {
    options.from = String(sender).trim();
  }

  let atResponse;
  try {
    atResponse = await sms.send(options);
  } catch (err) {
    const msg = err.message || 'Failed to send SMS';
    await SmsLog.create({
      organizationId,
      userId,
      messageId,
      to: normalizedTo,
      content,
      senderId: sender || null,
      status: 'failed',
      errorCode: 'SMS_SEND_FAILED',
      errorMessage: msg,
      rateAtSend: rate,
      atCostKes,
      costKes,
      units,
      balanceBefore,
      balanceAfter: balanceBefore,
      type,
    }).catch(() => {});
    logger.error('AT send threw: ' + msg);
    throw new AppError('SMS sending failed: ' + msg, 502, 'SMS_SEND_FAILED');
  }

  const recipients = atResponse?.SMSMessageData?.Recipients || [];
  const recipient = recipients[0] || {};
  const statusCode = Number(recipient.statusCode);
  const atMessageId = recipient.messageId || null;
  const atStatusText = recipient.status || '';

  if (AT_SUCCESS_CODES.has(statusCode)) {
    const debitResult = await smsWalletService.debit(organizationId, costKes);

    const balanceAfter = debitResult.success ? debitResult.balance : balanceBefore;

    await SmsLog.create({
      organizationId,
      userId,
      messageId,
      atMessageId,
      statusCode,
      to: normalizedTo,
      content,
      senderId: sender || null,
      status: 'sent',
      rateAtSend: rate,
      atCostKes,
      costKes,
      units,
      balanceBefore,
      balanceAfter,
      type,
    });

    if (!debitResult.success) {
      logger.warn(
        'SMS sent but debit raced: org=' + organizationId +
          ' cost=' + costKes + ' balance=' + debitResult.balance
      );
    }

    logger.info(
      'SMS sent: ' + messageId +
        ' at=' + (atMessageId || '—') +
        ' code=' + statusCode +
        ' org=' + organizationId +
        ' cost=' + costKes
    );

    return {
      success: true,
      messageId,
      atMessageId,
      statusCode,
      status: 'sent',
      costKes,
      balanceAfter,
    };
  }

  const mapped = AT_ERROR_MAP[statusCode] || {
    code: 'SMS_SEND_FAILED',
    http: 502,
    message: 'SMS sending failed (' + (atStatusText || 'unknown error') + ')',
  };

  await SmsLog.create({
    organizationId,
    userId,
    messageId,
    atMessageId,
    statusCode,
    to: normalizedTo,
    content,
    senderId: sender || null,
    status: 'failed',
    errorCode: mapped.code,
    errorMessage: atStatusText || mapped.message,
    rateAtSend: rate,
    atCostKes,
    costKes,
    units,
    balanceBefore,
    balanceAfter: balanceBefore,
    type,
  }).catch(() => {});

  if (statusCode === 405) {
    alertAdminProviderDry({ organizationId, to: normalizedTo, content });
  }

  logger.error(
    'AT send failed: code=' + statusCode + ' status="' + atStatusText +
      '" org=' + organizationId + ' to=' + normalizedTo
  );

  throw new AppError(mapped.message, mapped.http, mapped.code);
}

async function fetchATBalance() {
  if (!isConfigured()) {
    throw new AppError('SMS service is not configured', 503, 'SMS_NOT_CONFIGURED');
  }
  try {
    const application = AT.APPLICATION;
    if (!application || typeof application.fetchApplicationData !== 'function') {
      return { balance: null, note: 'AT balance API not available in SDK' };
    }
    const data = await application.fetchApplicationData();
    return { raw: data, balance: null };
  } catch (err) {
    logger.error('fetchATBalance failed: ' + err.message);
    throw new AppError('Failed to fetch AT balance: ' + err.message, 502, 'AT_BALANCE_FAILED');
  }
}

module.exports = {
  sendSms,
  isConfigured,
  computeUnits,
  fetchATBalance,
  generateMessageId,
};