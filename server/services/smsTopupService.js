const SmsWallet = require('../models/client/SmsWallet');
const Transaction = require('../models/client/Transaction');
const User = require('../models/client/User');
const emailService = require('./emailService');
const smsWalletService = require('./smsWalletService');
const logger = require('../utils/logger');

async function completeSmsTopup(transaction, providerData = {}, providerName = 'mpesa') {
  try {
    const meta = transaction.metadata?.get
      ? Object.fromEntries(transaction.metadata)
      : (transaction.metadata || {});

    const amountKes = Number(meta.amountKes) || Number(transaction.convertedAmount) || Number(transaction.amount) || 0;
    const units = Number(meta.units) || 0;

    if (!amountKes || amountKes <= 0) {
      logger.error('completeSmsTopup: invalid amount for tx ' + transaction._id);
      return { success: false, reason: 'invalid_amount' };
    }

    await Transaction.findByIdAndUpdate(transaction._id, {
      status: 'completed',
      'paymentProvider.name': providerName,
      'paymentProvider.transactionId': providerData.reference || null,
      'paymentProvider.receiptNumber': providerData.receiptNumber || null,
    });

    const creditResult = await smsWalletService.credit(transaction.organizationId, amountKes, {
      reason: 'topup',
      transactionId: transaction._id.toString(),
    });

    logger.info(
      'SMS wallet credited: org=' + transaction.organizationId +
      ' amount=' + amountKes +
      ' newBalance=' + creditResult.balance +
      ' tx=' + transaction._id
    );

    const user = transaction.userId
      ? await User.findById(transaction.userId).select('firstName email').lean()
      : await User.findOne({ organizationId: transaction.organizationId, role: 'owner' })
          .select('firstName email').lean();

    if (user?.email) {
      emailService.send(user.email, 'smsTopUpConfirmed', {
        firstName: user.firstName,
        amountKes,
        units,
        newBalance: creditResult.balance,
        method: providerName === 'mpesa' ? 'M-Pesa STK Push' : providerName,
        reference: providerData.receiptNumber || providerData.reference || '—',
        paidAt: new Date(),
      }, {
        priority: 'high',
        source: 'system',
        organizationId: transaction.organizationId,
        userId: user._id || transaction.userId,
        tags: ['sms', 'topup'],
      }).catch((err) => logger.error('smsTopUpConfirmed email failed: ' + err.message));
    }

    return { success: true, balance: creditResult.balance, amountKes };
  } catch (err) {
    logger.error('completeSmsTopup failed: ' + err.message);
    return { success: false, reason: err.message };
  }
}

module.exports = { completeSmsTopup };