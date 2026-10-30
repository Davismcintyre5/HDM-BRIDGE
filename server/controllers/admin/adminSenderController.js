const Sender = require('../../models/client/Sender');
const PlatformSender = require('../../models/admin/Sender');
const User = require('../../models/client/User');
const { AppError } = require('../../middleware/common/errorHandler');
const { invalidateUsageCache } = require('../../middleware/client/subscriptionCheck');
const logger = require('../../utils/logger');
const emailService = require('../../services/emailService');

const getSenders = async (req, res, next) => {
  try {
    const { verificationStatus } = req.query;
    const filter = {};
    if (verificationStatus) filter.verificationStatus = verificationStatus;

    const senders = await PlatformSender.find(filter)
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();

    const grouped = { verified: [], pending: [], rejected: [] };
    senders.forEach((s) => {
      if (s.verificationStatus === 'verified') grouped.verified.push(s);
      else if (s.verificationStatus === 'rejected') grouped.rejected.push(s);
      else grouped.pending.push(s);
    });

    res.status(200).json({
      success: true,
      grouped,
      defaultSender: senders.find((s) => s.isDefault) || null,
    });
  } catch (error) { next(error); }
};

const createSender = async (req, res, next) => {
  try {
    const { name, email, description, verifiedInBrevo } = req.body;
    if (!name || !email) {
      return next(new AppError('Name and email are required', 400, 'VALIDATION_001'));
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await PlatformSender.findOne({ email: normalizedEmail });
    if (existing) {
      return next(new AppError('Platform sender already exists', 409, 'CONFLICT_001'));
    }

    const sender = await PlatformSender.create({
      name,
      email: normalizedEmail,
      description,
      domain: normalizedEmail.split('@').pop(),
      verificationStatus: verifiedInBrevo ? 'verified' : 'pending',
      isVerified: !!verifiedInBrevo,
      isActive: true,
      verifiedAt: verifiedInBrevo ? new Date() : undefined,
    });

    logger.info('Platform sender created: ' + sender.email);
    res.status(201).json({ success: true, sender });
  } catch (error) { next(error); }
};

const updateSender = async (req, res, next) => {
  try {
    const { name, email, description, isActive } = req.body;
    const sender = await PlatformSender.findById(req.params.id);
    if (!sender) return next(new AppError('Sender not found', 404, 'NOT_FOUND'));

    if (name !== undefined) sender.name = name;
    if (email !== undefined) {
      const normalizedEmail = email.trim().toLowerCase();
      if (normalizedEmail !== sender.email) {
        const dup = await PlatformSender.findOne({ email: normalizedEmail, _id: { $ne: sender._id } });
        if (dup) return next(new AppError('Platform sender already exists', 409, 'CONFLICT_001'));
        sender.email = normalizedEmail;
        sender.domain = normalizedEmail.split('@').pop();
      }
    }
    if (description !== undefined) sender.description = description;
    if (isActive !== undefined) sender.isActive = isActive;

    await sender.save();
    logger.info('Platform sender updated: ' + sender.email);
    res.status(200).json({ success: true, sender });
  } catch (error) { next(error); }
};

const approveSender = async (req, res, next) => {
  try {
    const sender = await PlatformSender.findById(req.params.id);
    if (!sender) return next(new AppError('Sender not found', 404, 'NOT_FOUND'));
    if (sender.verificationStatus === 'verified') {
      return next(new AppError('Sender is already verified', 400, 'VALIDATION_001'));
    }

    sender.verificationStatus = 'verified';
    sender.isVerified = true;
    sender.verifiedAt = new Date();
    sender.rejectionReason = undefined;
    sender.rejectedAt = undefined;
    await sender.save();

    logger.info('Platform sender approved: ' + sender.email);
    res.status(200).json({ success: true, sender });
  } catch (error) { next(error); }
};

const rejectSender = async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason || !String(reason).trim()) {
      return next(new AppError('Rejection reason is required', 400, 'VALIDATION_001'));
    }

    const sender = await PlatformSender.findById(req.params.id);
    if (!sender) return next(new AppError('Sender not found', 404, 'NOT_FOUND'));

    sender.verificationStatus = 'rejected';
    sender.isVerified = false;
    sender.rejectionReason = String(reason).trim();
    sender.rejectedAt = new Date();
    await sender.save();

    logger.info('Platform sender rejected: ' + sender.email);
    res.status(200).json({ success: true, sender });
  } catch (error) { next(error); }
};

const setDefaultSender = async (req, res, next) => {
  try {
    const sender = await PlatformSender.findById(req.params.id);
    if (!sender) return next(new AppError('Sender not found', 404, 'NOT_FOUND'));
    if (sender.verificationStatus !== 'verified' || !sender.isActive) {
      return next(new AppError('Sender must be verified and active to be default', 400, 'VALIDATION_001'));
    }

    await PlatformSender.updateMany({}, { isDefault: false });
    sender.isDefault = true;
    await sender.save();

    logger.info('Default platform sender set: ' + sender.email);
    res.status(200).json({ success: true, sender });
  } catch (error) { next(error); }
};

const deleteSender = async (req, res, next) => {
  try {
    const sender = await PlatformSender.findByIdAndDelete(req.params.id);
    if (!sender) return next(new AppError('Sender not found', 404, 'NOT_FOUND'));

    logger.info('Platform sender deleted: ' + sender.email);
    res.status(200).json({ success: true, message: 'Sender deleted' });
  } catch (error) { next(error); }
};

const listClientSendersForReview = async (req, res, next) => {
  try {
    const senders = await Sender.find({
      reviewStatus: { $in: ['pending', 'rejected'] },
    })
      .populate('organizationId', 'name')
      .populate('userId', 'name email firstName lastName')
      .sort({ reviewSubmittedAt: -1, createdAt: -1 })
      .lean();

    const grouped = { pending: [], rejected: [] };
    senders.forEach((s) => {
      if (s.reviewStatus === 'rejected') grouped.rejected.push(s);
      else grouped.pending.push(s);
    });

    res.status(200).json({ success: true, grouped });
  } catch (error) { next(error); }
};

const resolveRecipient = async (sender) => {
  if (sender.userId && typeof sender.userId === 'object' && sender.userId.email) {
    return {
      email: sender.userId.email,
      firstName: sender.userId.firstName || sender.userId.name || null,
    };
  }

  if (sender.userId) {
    const user = await User.findById(sender.userId)
      .select('email firstName name')
      .lean();
    if (user?.email) {
      return { email: user.email, firstName: user.firstName || user.name || null };
    }
  }

  return { email: sender.email, firstName: null };
};

const notifyClientOfSenderReview = async ({ templateKey, sender, data = {} }) => {
  try {
    const recipient = await resolveRecipient(sender);
    if (!recipient.email) {
      logger.warn('No recipient for ' + templateKey + ': ' + sender.email);
      return;
    }

    await emailService.send(
      recipient.email,
      templateKey,
      {
        firstName: recipient.firstName,
        senderName: sender.name,
        senderEmail: sender.email,
        sendersUrl: (process.env.CLIENT_URL || 'http://localhost:3000') + '/senders',
        ...data,
      },
      {
        organizationId: sender.organizationId,
        userId: sender.userId?._id || sender.userId || null,
        source: 'system',
        tags: ['senders', templateKey],
      }
    );
  } catch (err) {
    logger.error('Failed to send ' + templateKey + ': ' + err.message);
  }
};

const approveClientSender = async (req, res, next) => {
  try {
    const sender = await Sender.findOne({
      _id: req.params.id,
      reviewStatus: 'pending',
    });
    if (!sender) return next(new AppError('Pending sender not found', 404, 'NOT_FOUND'));

    sender.reviewStatus = 'approved';
    sender.isVerified = true;
    sender.reviewedAt = new Date();
    sender.reviewedBy = req.user?._id || null;
    sender.rejectionReason = undefined;
    sender.rejectedAt = undefined;
    await sender.save();

    await invalidateUsageCache(sender.organizationId, 'senders');
    logger.info('Client sender approved: ' + sender.email);

    notifyClientOfSenderReview({ templateKey: 'senderApproved', sender });

    res.status(200).json({
      success: true,
      sender,
      message: 'Sender approved and enabled for the customer.',
    });
  } catch (error) { next(error); }
};

const rejectClientSender = async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason || !String(reason).trim()) {
      return next(new AppError('Rejection reason is required', 400, 'VALIDATION_001'));
    }

    const sender = await Sender.findOne({
      _id: req.params.id,
      reviewStatus: 'pending',
    });
    if (!sender) return next(new AppError('Pending sender not found', 404, 'NOT_FOUND'));

    const trimmedReason = String(reason).trim();

    sender.reviewStatus = 'rejected';
    sender.isVerified = false;
    sender.rejectionReason = trimmedReason;
    sender.rejectedAt = new Date();
    sender.reviewedBy = req.user?._id || null;
    await sender.save();

    await invalidateUsageCache(sender.organizationId, 'senders');
    logger.info('Client sender rejected: ' + sender.email + ' — ' + trimmedReason);

    notifyClientOfSenderReview({
      templateKey: 'senderRejected',
      sender,
      data: { reason: trimmedReason },
    });

    res.status(200).json({
      success: true,
      sender,
      message: 'Sender rejected. The customer has been notified.',
    });
  } catch (error) { next(error); }
};

module.exports = {
  getSenders,
  createSender,
  updateSender,
  approveSender,
  rejectSender,
  setDefaultSender,
  deleteSender,
  listClientSendersForReview,
  approveClientSender,
  rejectClientSender,
};