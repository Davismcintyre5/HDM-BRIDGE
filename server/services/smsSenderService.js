const ClientSender = require('../models/client/Sender');
const PlatformSender = require('../models/admin/Sender');
const { AppError } = require('../middleware/common/errorHandler');
const { getDefaultSender } = require('./smsPricingService');
const logger = require('../utils/logger');

async function resolveSender({ organizationId, requested, isAdmin = false }) {
  if (requested && String(requested).trim()) {
    const name = String(requested).trim();

    if (isAdmin) {
      const ok = await PlatformSender.findOne({
        name,
        verificationStatus: 'verified',
        isActive: true,
      });
      if (!ok) {
        throw new AppError(
          'Sender "' + name + '" is not verified on the platform',
          400,
          'SMS_SENDER_NOT_APPROVED'
        );
      }
      if (!ok.atRegistered) {
        throw new AppError(
          'Sender "' + name + '" is approved but not registered in Africa\'s Talking yet',
          400,
          'SMS_SENDER_NOT_AT_REGISTERED'
        );
      }
      return name;
    }

    const sender = await ClientSender.findOne({
      organizationId,
      name,
      reviewStatus: 'approved',
      isVerified: true,
      isActive: true,
    });

    if (!sender) {
      throw new AppError(
        'Sender "' + name + '" is not approved for your organization. ' +
          'Submit it in Senders and wait for admin approval.',
        400,
        'SMS_SENDER_NOT_APPROVED'
      );
    }

    if (!sender.channels || !sender.channels.includes('sms')) {
      throw new AppError(
        'Sender "' + name + '" is not enabled for SMS',
        400,
        'SMS_SENDER_NOT_APPROVED'
      );
    }

    if (!sender.atRegistered) {
      throw new AppError(
        'Sender "' + name + '" is approved but not yet registered with our SMS provider.',
        400,
        'SMS_SENDER_NOT_AT_REGISTERED'
      );
    }

    return name;
  }

  if (!isAdmin && organizationId) {
    const orgDefault = await ClientSender.findOne({
      organizationId,
      reviewStatus: 'approved',
      isVerified: true,
      isActive: true,
      isDefault: true,
      channels: 'sms',
      atRegistered: { $ne: null },
    });
    if (orgDefault) return orgDefault.name;
  }

  const platformDefault = await getDefaultSender();
  if (platformDefault) {
    const ok = await PlatformSender.findOne({
      name: platformDefault,
      verificationStatus: 'verified',
      isActive: true,
      atRegistered: { $ne: null },
    });
    if (ok) return platformDefault;
    logger.warn(
      'sms_default_sender "' + platformDefault +
        '" is set but not verified/AT-registered; falling through'
    );
  }

  if (process.env.AT_SENDER_ID && process.env.AT_SENDER_ID.trim()) {
    return process.env.AT_SENDER_ID.trim();
  }

  return null;
}

module.exports = { resolveSender };