const mongoose = require('mongoose');

const smsWalletSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      unique: true,
      index: true,
    },
    balance: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'KES' },
    lifetimeToppedUp: { type: Number, default: 0 },
    lifetimeSpent: { type: Number, default: 0 },
    lastTopUpAt: Date,
    lastTopUpAmount: Number,
    lastLowBalanceReminderAt: Date,
  },
  { timestamps: true }
);

smsWalletSchema.index({ balance: 1 });

module.exports = mongoose.model('SmsWallet', smsWalletSchema);