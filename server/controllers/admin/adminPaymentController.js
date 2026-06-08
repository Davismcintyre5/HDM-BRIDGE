const Transaction = require('../../models/client/Transaction');
const Subscription = require('../../models/client/Subscription');
const stripeService = require('../../services/stripeService');
const paypalService = require('../../services/paypalService');
const Helpers = require('../../utils/helpers');
const { AppError } = require('../../middleware/common/errorHandler');
const logger = require('../../utils/logger');

// @desc    Get all transactions
// @route   GET /admin/api/payments
// @access  Private (Admin)
const getTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, method, startDate, endDate, search, sort = '-createdAt' } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (method) filter.paymentMethod = method;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    if (search) {
      filter.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { 'billingDetails.email': { $regex: search, $options: 'i' } },
        { 'billingDetails.name': { $regex: search, $options: 'i' } },
      ];
    }

    const { skip, limit: pageLimit } = Helpers.paginate(page, limit);

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate('organizationId', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(pageLimit),
      Transaction.countDocuments(filter),
    ]);

    // Calculate totals
    const revenueStats = await Transaction.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$currency', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      ...Helpers.buildPaginationResponse(transactions, total, page, pageLimit),
      revenue: revenueStats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transaction
// @route   GET /admin/api/payments/:id
// @access  Private (Admin)
const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('organizationId', 'name email')
      .populate('userId', 'firstName lastName email');

    if (!transaction) {
      return next(new AppError('Transaction not found', 404, 'NOT_FOUND'));
    }

    res.status(200).json({ success: true, transaction });
  } catch (error) {
    next(error);
  }
};

// @desc    Process refund
// @route   POST /admin/api/payments/:id/refund
// @access  Private (Admin)
const processRefund = async (req, res, next) => {
  try {
    const { amount, reason } = req.body;

    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return next(new AppError('Transaction not found', 404, 'NOT_FOUND'));
    }

    if (transaction.status === 'refunded') {
      return next(new AppError('Transaction already refunded', 400, 'VALIDATION_001'));
    }

    let refundResult;
    switch (transaction.paymentMethod) {
      case 'stripe':
        refundResult = await stripeService.createRefund(
          transaction.paymentProvider.transactionId,
          amount || transaction.amount,
          reason || 'Admin refund'
        );
        break;
      case 'paypal':
        refundResult = await paypalService.createRefund(
          transaction.paymentProvider.transactionId,
          amount || transaction.amount,
          reason || 'Admin refund'
        );
        break;
      default:
        // Manual refund for M-Pesa / Bank
        await Transaction.findByIdAndUpdate(req.params.id, {
          status: 'refunded',
          refundDetails: {
            refundedAt: new Date(),
            refundAmount: amount || transaction.amount,
            reason: reason || 'Manual admin refund',
          },
        });
        refundResult = { manual: true };
    }

    logger.info(`Admin processed refund for transaction: ${transaction._id}`);

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      refund: refundResult,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create manual invoice
// @route   POST /admin/api/payments/manual
// @access  Private (Admin)
const createManualInvoice = async (req, res, next) => {
  try {
    const { organizationId, amount, currency, description, paymentMethod } = req.body;

    const transaction = await Transaction.create({
      organizationId,
      type: 'manual',
      status: 'completed',
      amount,
      currency: currency || 'USD',
      paymentMethod: paymentMethod || 'manual',
      description: description || 'Manual invoice',
    });

    logger.info(`Admin created manual invoice: ${transaction.invoiceNumber}`);

    res.status(201).json({ success: true, transaction });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all subscriptions
// @route   GET /admin/api/subscriptions
// @access  Private (Admin)
const getSubscriptions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const { skip, limit: pageLimit } = Helpers.paginate(page, limit);

    const [subscriptions, total] = await Promise.all([
      Subscription.find(filter)
        .populate('organizationId', 'name email')
        .populate('planId', 'name tier')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageLimit),
      Subscription.countDocuments(filter),
    ]);

    res.status(200).json(Helpers.buildPaginationResponse(subscriptions, total, page, pageLimit));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  getTransactionById,
  processRefund,
  createManualInvoice,
  getSubscriptions,
};