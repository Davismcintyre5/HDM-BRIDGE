const router = require('express').Router();
const {
  getWallets,
  getWalletByOrg,
  grantCredits,
  getMargin,
  getConfig,
} = require('../../controllers/admin/adminSmsController');
const { adminAuth, checkPermission } = require('../../middleware/admin/adminAuth');
const { auditLog } = require('../../middleware/admin/adminAudit');

router.get('/wallets', adminAuth, checkPermission('system.view'), getWallets);
router.get('/wallets/:orgId', adminAuth, checkPermission('system.view'), getWalletByOrg);
router.post(
  '/wallets/:orgId/grant',
  adminAuth,
  checkPermission('system.edit'),
  auditLog('grant_credits', 'sms_wallet'),
  grantCredits
);
router.get('/margin', adminAuth, checkPermission('analytics.view'), getMargin);
router.get('/config', adminAuth, checkPermission('system.view'), getConfig);

module.exports = router;