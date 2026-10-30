const mongoose = require('mongoose');

const platformSenderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Sender name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Sender email is required'],
      lowercase: true,
      trim: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    isDefault: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    verificationStatus: {
      type: String,
      enum: ['verified', 'pending', 'rejected'],
      default: 'pending',
      index: true,
    },
    source: {
      type: String,
      enum: ['direct', 'application'],
      default: 'direct',
    },
    verifiedInBrevo: {
      type: Boolean,
      default: false,
    },
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminUser',
    },
    rejectionReason: String,
    rejectedAt: Date,
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminUser',
    },
    applicantEmail: String,
    applicantName: String,
    applicantOrganizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
    },
    applicationNotes: String,
  },
  {
    timestamps: true,
  }
);

platformSenderSchema.index({ verificationStatus: 1, isActive: 1 });
platformSenderSchema.index({ isDefault: 1, verificationStatus: 1 });

platformSenderSchema.pre('save', async function (next) {
  if (this.isModified('isDefault') && this.isDefault) {
    await mongoose.model('PlatformSender').updateMany(
      { _id: { $ne: this._id }, isDefault: true },
      { $set: { isDefault: false } }
    );
  }
  next();
});

module.exports = mongoose.model('PlatformSender', platformSenderSchema, 'platformsenders');