const smsService = require('../../services/smsService');
const smsWalletService = require('../../services/smsWalletService');
const smsPricingService = require('../../services/smsPricingService');
const smsSenderService = require('../../services/smsSenderService');
const SmsLog = require('../../models/client/SmsLog');
const Transaction = require('../../models/client/Transaction');
const mpesaService = require('../../services/mpesaService');
const { AppError } = require('../../middleware/common/errorHandler');
const logger = require('../../utils/logger');

const sendSms = async (req, res, next) => {
  try {
    const { to, content, sender, type } = req.body;

    if (!to || !String(to).trim()) {
      return next(new AppError('Recipient phone number is required', 400, 'VALIDATION_001'));
    }
    if (!content || !String(content).trim()) {
      return next(new AppError('Message content is required', 400, 'VALIDATION_001'));
    }

    const resolvedSender = await smsSenderService.resolveSender({
      organizationId: req.organizationId,
      requested: sender,
      isAdmin: false,
    });

    const result = await smsService.sendSms({
      organizationId: req.organizationId,
      userId: req.user?._id || req.user?.id || null,
      to: String(to).trim(),
      content: String(content).trim(),
      sender: resolvedSender,
      type: type === 'marketing' ? 'marketing' : 'transactional',
    });

    logger.info('SMS sent: ' + result.messageId + ' org=' + req.organizationId);

    res.status(200).json({
      success: true,
      messageId: result.messageId,
      atMessageId: result.atMessageId,
      status: 'sent',
      costKes: result.costKes,
      balanceAfter: result.balanceAfter,
    });
  } catch (error) {
    next(error);
  }
};

const getLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const filter = { organizationId: req.organizationId };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;

    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      SmsLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      SmsLog.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        page, limit, total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [todaySent, monthSent, totalSent, todayFailed, monthFailed, spendAgg] = await Promise.all([
      SmsLog.countDocuments({ organizationId: req.organizationId, status: 'sent', createdAt: { $gte: today } }),
      SmsLog.countDocuments({ organizationId: req.organizationId, status: 'sent', createdAt: { $gte: monthStart } }),
      SmsLog.countDocuments({ organizationId: req.organizationId, status: 'sent' }),
      SmsLog.countDocuments({ organizationId: req.organizationId, status: 'failed', createdAt: { $gte: today } }),
      SmsLog.countDocuments({ organizationId: req.organizationId, status: 'failed', createdAt: { $gte: monthStart } }),
      SmsLog.aggregate([
        { $match: { organizationId: req.organizationId, status: 'sent' } },
        { $group: { _id: null, total: { $sum: '$costKes' }, units: { $sum: '$units' } } },
      ]),
    ]);

    const balance = await smsWalletService.getBalance(req.organizationId);

    res.status(200).json({
      success: true,
      stats: {
        todaySent,
        monthSent,
        totalSent,
        todayFailed,
        monthFailed,
        totalSpentKes: spendAgg[0]?.total || 0,
        totalUnits: spendAgg[0]?.units || 0,
        balance,
        currency: 'KES',
      },
    });
  } catch (error) {
    next(error);
  }
};

const getWallet = async (req, res, next) => {
  try {
    const wallet = await smsWalletService.getOrCreate(req.organizationId);
    const rate = await smsPricingService.getRate();
    const minTopup = await smsPricingService.getMinTopup();
    const lowBalance = await smsPricingService.getLowBalanceThreshold();

    const recentTopups = await Transaction.find({
      organizationId: req.organizationId,
      type: 'sms_topup',
      status: 'completed',
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.status(200).json({
      success: true,
      wallet: {
        balance: wallet.balance,
        currency: wallet.currency || 'KES',
        lifetimeToppedUp: wallet.lifetimeToppedUp || 0,
        lifetimeSpent: wallet.lifetimeSpent || 0,
        lastTopUpAt: wallet.lastTopUpAt || null,
        lastTopUpAmount: wallet.lastTopUpAmount || null,
      },
      config: {
        rateKes: rate,
        minTopupKes: minTopup,
        lowBalanceKes: lowBalance,
      },
      recentTopups,
    });
  } catch (error) {
    next(error);
  }
};

const createTopup = async (req, res, next) => {
  try {
    const { amountKes, phoneNumber } = req.body;

    const amt = Number(amountKes);
    if (!amt || amt <= 0) {
      return next(new AppError('amountKes must be a positive number', 400, 'VALIDATION_001'));
    }

    const minTopup = await smsPricingService.getMinTopup();
    if (amt < minTopup) {
      return next(new AppError(
        'Minimum top-up is KSh ' + minTopup.toFixed(2),
        400,
        'VALIDATION_001'
      ));
    }

    if (!phoneNumber || !String(phoneNumber).trim()) {
      return next(new AppError('phoneNumber is required for M-Pesa', 400, 'VALIDATION_001'));
    }

    const rate = await smsPricingService.getRate();
    const units = Math.floor(amt / rate);

    let transaction = await Transaction.findOne({
      organizationId: req.organizationId,
      type: 'sms_topup',
      status: 'pending',
      'mpesaDetails.phoneNumber': String(phoneNumber).trim(),
      createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) },
    });

    if (transaction) {
      return res.status(200).json({
        success: true,
        transactionId: transaction._id,
        checkoutRequestId: transaction.mpesaDetails?.checkoutRequestId,
        message: 'An existing top-up is still pending. Check your phone.',
        pending: true,
      });
    }

    transaction = await Transaction.create({
      organizationId: req.organizationId,
      userId: req.user?._id || req.user?.id,
      type: 'sms_topup',
      status: 'pending',
      amount: amt,
      currency: 'KES',
      convertedAmount: amt,
      paymentMethod: 'mpesa',
      description: 'SMS wallet top-up: KSh ' + amt.toFixed(2) + ' (' + units + ' SMS)',
      metadata: {
        type: 'sms_topup',
        amountKes: amt,
        units,
        rateAtPurchase: rate,
      },
    });

    const result = await mpesaService.initiateSTKPush({
      phone: String(phoneNumber).trim(),
      amount: amt,
      accountReference: 'SMSTOPUP-' + transaction._id.toString().slice(-8),
      description: 'SMS Wallet Top-up',
    });

    if (!result.success) {
      await Transaction.findByIdAndUpdate(transaction._id, {
        status: 'failed',
        'mpesaDetails.resultDesc': result.error?.errorMessage || 'STK push failed',
      });
      return next(new AppError(
        result.error?.errorMessage || 'STK push failed',
        502,
        'MPESA_001'
      ));
    }

    await Transaction.findByIdAndUpdate(transaction._id, {
      status: 'pending',
      'mpesaDetails.merchantRequestId': result.merchantRequestId,
      'mpesaDetails.checkoutRequestId': result.checkoutRequestId,
      'mpesaDetails.phoneNumber': String(phoneNumber).trim(),
      'mpesaDetails.resultCode': undefined,
      'mpesaDetails.resultDesc': undefined,
    });

    logger.info('SMS top-up STK initiated: tx=' + transaction._id + ' id=' + result.checkoutRequestId);

    res.status(200).json({
      success: true,
      transactionId: transaction._id,
      checkoutRequestId: result.checkoutRequestId,
      amountKes: amt,
      units,
      message: 'Check your phone to complete the M-Pesa payment.',
    });
  } catch (error) {
    next(error);
  }
};

const getTopupStatus = async (req, res, next) => {
  try {
    const { transactionId } = req.params;

    const transaction = await Transaction.findOne({
      _id: transactionId,
      organizationId: req.organizationId,
      type: 'sms_topup',
    });

    if (!transaction) {
      return next(new AppError('Top-up transaction not found', 404, 'NOT_FOUND'));
    }

    if (transaction.status === 'completed') {
      return res.status(200).json({
        success: true,
        status: 'success',
        amountKes: transaction.convertedAmount || transaction.amount,
        receipt: transaction.mpesaDetails?.mpesaReceiptNumber,
        message: 'Top-up completed',
      });
    }

    if (transaction.status === 'failed') {
      return res.status(200).json({
        success: true,
        status: 'failed',
        message: transaction.mpesaDetails?.resultDesc || 'Top-up failed',
      });
    }

    const checkoutRequestId = transaction.mpesaDetails?.checkoutRequestId;
    if (!checkoutRequestId) {
      return res.status(200).json({ success: true, status: 'pending', message: 'Awaiting STK push' });
    }

    const result = await mpesaService.querySTKStatus(checkoutRequestId);
    if (!result.success) {
      return res.status(200).json({ success: true, status: 'pending', message: 'Awaiting payment' });
    }

    const pendingCodes = new Set([
      mpesaService.RESULT_CODES.TRANSACTION_NOT_FOUND,
      '500.001.1001',
      '4999',
    ]);

    if (pendingCodes.has(result.resultCode)) {
      return res.status(200).json({ success: true, status: 'pending', message: 'Awaiting payment' });
    }

    if (result.resultCode === mpesaService.RESULT_CODES.SUCCESS) {
      return res.status(200).json({ success: true, status: 'success', message: 'Payment received' });
    }

    return res.status(200).json({
      success: true,
      status: 'failed',
      message: result.resultDesc || 'Payment failed',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendSms,
  getLogs,
  getStats,
  getWallet,
  createTopup,
  getTopupStatus,
};