const mongoose = require('mongoose');

const smsLogSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    messageId: {
      type: String,
      required: true,
      unique: true,
    },
    atMessageId: String,
    statusCode: Number,
    to: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 1600,
    },
    senderId: String,
    status: {
      type: String,
      enum: ['queued', 'sent', 'failed', 'delivered'],
      default: 'queued',
    },
    errorCode: String,
    errorMessage: String,
    rateAtSend: Number,
    atCostKes: Number,
    costKes: Number,
    units: { type: Number, default: 1 },
    balanceBefore: Number,
    balanceAfter: Number,
    type: {
      type: String,
      enum: ['transactional', 'marketing'],
      default: 'transactional',
    },
  },
  { timestamps: true }
);

smsLogSchema.index({ organizationId: 1, createdAt: -1 });
smsLogSchema.index({ messageId: 1 });
smsLogSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('SmsLog', smsLogSchema);