const Sender = require('../../models/client/Sender');
const PlatformSender = require('../../models/admin/Sender');
const AdminUser = require('../../models/admin/AdminUser');
const { AppError } = require('../../middleware/common/errorHandler');
const { invalidateUsageCache } = require('../../middleware/client/subscriptionCheck');
const logger = require('../../utils/logger');
const emailService = require('../../services/emailService');

const getSenders = async (req, res, next) => {
  try {
    const senders = await Sender.find({ organizationId: req.organizationId })
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();
    res.status(200).json({ success: true, senders });
  } catch (error) { next(error); }
};

const getPlatformSenders = async (req, res, next) => {
  try {
    const senders = await PlatformSender.find({
      verificationStatus: 'verified',
      isActive: true,
    })
      .select('name email description isDefault')
      .sort({ isDefault: -1, name: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: senders.length,
      senders,
      defaultSender: senders.find((s) => s.isDefault) || null,
    });
  } catch (error) { next(error); }
};

const getAdminRecipients = async () => {
  const admins = await AdminUser.find({ isActive: true })
    .select('email firstName lastName')
    .lean();

  const seen = new Set();
  return admins
    .filter((a) => {
      const key = String(a.email || '').toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((a) => ({
      email: a.email,
      firstName: a.firstName || 'Admin',
    }));
};

const notifyAdminsOfSenderApplication = async ({ sender, req }) => {
  try {
    const admins = await getAdminRecipients();
    if (!admins.length) {
      logger.warn('No active admins for sender-application alert');
      return;
    }

    const templateData = {
      senderName: sender.name,
      senderEmail: sender.email,
      domain: sender.domain,
      orgName: req.organization?.name || req.organization?.companyName || '—',
      userName: req.user?.name || null,
      userEmail: req.user?.email || null,
      submittedAt: sender.reviewSubmittedAt || sender.createdAt || new Date(),
      reviewUrl: (process.env.ADMIN_URL || 'http://localhost:3001') + '/senders',
    };

    const results = await Promise.allSettled(
      admins.map((admin) =>
        emailService.send(
          admin.email,
          'adminNewSenderApplication',
          { ...templateData, adminName: admin.firstName },
          {
            organizationId: sender.organizationId,
            userId: sender.userId || req.user?._id,
            source: 'system',
            tags: ['senders', 'admin-alert'],
          }
        )
      )
    );

    const failed = results.filter((r) => r.status === 'rejected');
    if (failed.length) {
      logger.error(
        'adminNewSenderApplication: ' + failed.length + '/' + admins.length +
        ' failed — ' + failed.map((f) => f.reason?.message || 'unknown').join('; ')
      );
    }
  } catch (err) {
    logger.error('Failed to notify admins of sender application: ' + err.message);
  }
};

const addSender = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return next(new AppError('Name and email are required', 400, 'VALIDATION_001'));
    }

    const normalizedEmail = email.trim().toLowerCase();
    const domain = normalizedEmail.split('@').pop();

    const currentCount = await Sender.countDocuments({
      organizationId: req.organizationId,
      reviewStatus: { $ne: 'rejected' },
    });
    if (req.planLimits && currentCount >= req.planLimits.senders) {
      return next(new AppError('Sender limit reached for your plan', 429, 'LIMIT_001'));
    }

    const existing = await Sender.findOne({
      organizationId: req.organizationId,
      email: normalizedEmail,
    });

    if (existing) {
      if (existing.reviewStatus === 'rejected') {
        existing.name = name;
        existing.domain = domain;
        existing.isVerified = false;
        existing.reviewStatus = 'pending';
        existing.reviewSubmittedAt = new Date();
        existing.rejectionReason = undefined;
        existing.rejectedAt = undefined;
        await existing.save();

        await invalidateUsageCache(req.organizationId, 'senders');
        logger.info('Sender resubmitted for review: ' + existing.email);

        notifyAdminsOfSenderApplication({ sender: existing, req });

        return res.status(200).json({
          success: true,
          sender: existing,
          message: 'Sender resubmitted for review. We will notify you once it is approved.',
        });
      }
      return next(new AppError('Sender email already exists', 409, 'CONFLICT_001'));
    }

    const sender = await Sender.create({
      organizationId: req.organizationId,
      userId: req.user._id,
      name,
      email: normalizedEmail,
      domain,
      isVerified: false,
      reviewStatus: 'pending',
      reviewSubmittedAt: new Date(),
    });

    await invalidateUsageCache(req.organizationId, 'senders');
    logger.info('Sender submitted for review: ' + sender.email);

    notifyAdminsOfSenderApplication({ sender, req });

    res.status(201).json({
      success: true,
      sender,
      message: 'Sender submitted for review. We will notify you once it is approved.',
    });
  } catch (error) { next(error); }
};

const setDefault = async (req, res, next) => {
  try {
    const sender = await Sender.findOne({
      _id: req.params.id,
      organizationId: req.organizationId,
    });
    if (!sender) return next(new AppError('Sender not found', 404, 'NOT_FOUND'));

    if (sender.reviewStatus !== 'approved' || !sender.isVerified) {
      return next(new AppError('Sender must be approved before it can be default', 400, 'VALIDATION_001'));
    }

    await Sender.updateMany(
      { organizationId: req.organizationId },
      { isDefault: false }
    );

    sender.isDefault = true;
    await sender.save();

    logger.info('Default sender set: ' + sender.email);
    res.status(200).json({ success: true, sender });
  } catch (error) { next(error); }
};

const deleteSender = async (req, res, next) => {
  try {
    const sender = await Sender.findOneAndDelete({
      _id: req.params.id,
      organizationId: req.organizationId,
    });
    if (!sender) return next(new AppError('Sender not found', 404, 'NOT_FOUND'));

    await invalidateUsageCache(req.organizationId, 'senders');
    logger.info('Sender deleted: ' + sender.email);

    res.status(200).json({ success: true, message: 'Sender deleted' });
  } catch (error) { next(error); }
};

module.exports = {
  getSenders,
  getPlatformSenders,
  addSender,
  setDefault,
  deleteSender,
};