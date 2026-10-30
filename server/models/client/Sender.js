const mongoose = require('mongoose');

const senderSchema = new mongoose.Schema(
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
      required: true,
    },
    email: {
      type: String,
      required: [true, 'Sender email is required'],
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Sender name is required'],
      trim: true,
      maxlength: 100,
    },
    domain: String,

    // ── verification (usable flag) ────────────────────────────────
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminUser',
    },

    // ── admin review workflow ────────────────────────────────────
    reviewStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    reviewSubmittedAt: {
      type: Date,
      default: Date.now,
    },
    rejectionReason: String,
    rejectedAt: Date,
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminUser',
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    replyTo: String,
    signature: String,
  },
  {
    timestamps: true,
  }
);

senderSchema.index({ organizationId: 1, email: 1 }, { unique: true });
senderSchema.index({ isVerified: 1 });
senderSchema.index({ reviewStatus: 1, reviewSubmittedAt: -1 });

module.exports = mongoose.model('Sender', senderSchema);