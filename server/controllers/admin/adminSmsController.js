const SmsWallet = require('../../models/client/SmsWallet');
const SmsLog = require('../../models/client/SmsLog');
const Organization = require('../../models/client/Organization');
const smsPricingService = require('../../services/smsPricingService');
const smsWalletService = require('../../services/smsWalletService');
const smsService = require('../../services/smsService');
const { AppError } = require('../../middleware/common/errorHandler');
const logger = require('../../utils/logger');

const getWallets = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { lowBalance, search } = req.query;

    const filter = {};

    if (lowBalance === 'true') {
      const threshold = await smsPricingService.getLowBalanceThreshold();
      filter.balance = { $lt: threshold };
    }

    if (search) {
      const orgs = await Organization.find({
        name: { $regex: search, $options: 'i' },
      }).select('_id').lean();
      filter.organizationId = { $in: orgs.map(o => o._id) };
    }

    const skip = (page - 1) * limit;
    const [wallets, total] = await Promise.all([
      SmsWallet.find(filter)
        .populate('organizationId', 'name email')
        .sort({ balance: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      SmsWallet.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: wallets,
      pagination: {
        page, limit, total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) { next(error); }
};

const getWalletByOrg = async (req, res, next) => {
  try {
    const { orgId } = req.params;

    const wallet = await SmsWallet.findOne({ organizationId: orgId })
      .populate('organizationId', 'name email');
    if (!wallet) {
      return next(new AppError('SMS wallet not found', 404, 'NOT_FOUND'));
    }

    const recentLogs = await SmsLog.find({ organizationId: orgId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.status(200).json({ success: true, wallet, recentLogs });
  } catch (error) { next(error); }
};

const grantCredits = async (req, res, next) => {
  try {
    const { orgId } = req.params;
    const { amountKes, reason } = req.body;

    const amount = Number(amountKes);
    if (!amount || amount <= 0) {
      return next(new AppError('amountKes must be a positive number', 400, 'VALIDATION_001'));
    }
    if (!reason || !String(reason).trim()) {
      return next(new AppError('reason is required', 400, 'VALIDATION_001'));
    }

    const org = await Organization.findById(orgId).select('name').lean();
    if (!org) {
      return next(new AppError('Organization not found', 404, 'NOT_FOUND'));
    }

    const result = await smsWalletService.credit(orgId, amount, {
      reason: 'admin_grant: ' + String(reason).trim(),
      transactionId: 'admin_' + req.admin._id,
    });

    logger.info(
      'Admin ' + req.admin.email + ' granted ' + amount + ' KES to org ' + orgId +
      ' reason: ' + String(reason).trim()
    );

    res.status(200).json({
      success: true,
      balance: result.balance,
      currency: result.currency,
      granted: amount,
      reason: String(reason).trim(),
      organization: org.name,
    });
  } catch (error) { next(error); }
};

const getMargin = async (req, res, next) => {
  try {
    const now = new Date();
    const from = req.query.from
      ? new Date(req.query.from)
      : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const to = req.query.to ? new Date(req.query.to) : now;

    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      return next(new AppError('Invalid date range', 400, 'VALIDATION_001'));
    }
    if (from > to) {
      return next(new AppError('from must be before to', 400, 'VALIDATION_001'));
    }

    const agg = await SmsLog.aggregate([
      {
        $match: {
          status: 'sent',
          createdAt: { $gte: from, $lte: to },
        },
      },
      {
        $group: {
          _id: null,
          totalSms: { $sum: 1 },
          totalUnits: { $sum: '$units' },
          revenue: { $sum: '$costKes' },
          atCost: { $sum: '$atCostKes' },
        },
      },
    ]);

    const row = agg[0] || { totalSms: 0, totalUnits: 0, revenue: 0, atCost: 0 };
    const margin = +(row.revenue - row.atCost).toFixed(2);
    const marginPct = row.revenue > 0 ? +((margin / row.revenue) * 100).toFixed(2) : 0;

    const currentRate = await smsPricingService.getRate();
    const atCostPerSms = smsPricingService.getAtCostPerSms();

    res.status(200).json({
      success: true,
      from,
      to,
      totals: {
        totalSms: row.totalSms,
        totalUnits: row.totalUnits,
        revenue: +row.revenue.toFixed(2),
        atCost: +row.atCost.toFixed(2),
        margin,
        marginPct,
      },
      config: {
        currentRateKes: currentRate,
        atCostKes: atCostPerSms,
        currentMarginPerSms: +(currentRate - atCostPerSms).toFixed(2),
      },
    });
  } catch (error) { next(error); }
};

const getConfig = async (req, res, next) => {
  try {
    const rateKes = await smsPricingService.getRate();
    const minTopup = await smsPricingService.getMinTopup();
    const lowBalance = await smsPricingService.getLowBalanceThreshold();
    const defaultSender = await smsPricingService.getDefaultSender();
    const atCost = smsPricingService.getAtCostPerSms();

    const { isSmsEnabled } = require('../../middleware/common/smsGate');
    const enabled = await isSmsEnabled();

    res.status(200).json({
      success: true,
      config: {
        enabled,
        configured: smsService.isConfigured(),
        provider: "Africa's Talking",
        atUsername: process.env.AT_USERNAME || '',
        atSenderId: process.env.AT_SENDER_ID || '',
        defaultSender: defaultSender || '(AT default)',
        rateKes,
        minTopupKes: minTopup,
        lowBalanceKes: lowBalance,
        atCostKes: atCost,
        marginPerSmsKes: +(rateKes - atCost).toFixed(2),
      },
    });
  } catch (error) { next(error); }
};

module.exports = {
  getWallets,
  getWalletByOrg,
  grantCredits,
  getMargin,
  getConfig,
};