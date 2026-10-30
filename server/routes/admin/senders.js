const router = require('express').Router();
const {
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
} = require('../../controllers/admin/adminSenderController');
const { adminAuth, checkPermission } = require('../../middleware/admin/adminAuth');
const { auditLog } = require('../../middleware/admin/adminAudit');

router.get(
  '/client-review',
  adminAuth,
  checkPermission('system.view'),
  listClientSendersForReview
);
router.put(
  '/client-review/:id/approve',
  adminAuth,
  checkPermission('system.edit'),
  auditLog('approve', 'client_sender'),
  approveClientSender
);
router.put(
  '/client-review/:id/reject',
  adminAuth,
  checkPermission('system.edit'),
  auditLog('reject', 'client_sender'),
  rejectClientSender
);

router.get('/', adminAuth, checkPermission('system.view'), getSenders);
router.post('/', adminAuth, checkPermission('system.edit'), auditLog('create', 'sender'), createSender);
router.put('/:id', adminAuth, checkPermission('system.edit'), auditLog('update', 'sender'), updateSender);
router.put('/:id/approve', adminAuth, checkPermission('system.edit'), auditLog('approve', 'sender'), approveSender);
router.put('/:id/reject', adminAuth, checkPermission('system.edit'), auditLog('reject', 'sender'), rejectSender);
router.put('/:id/default', adminAuth, checkPermission('system.edit'), auditLog('set_default', 'sender'), setDefaultSender);
router.delete('/:id', adminAuth, checkPermission('system.edit'), auditLog('delete', 'sender'), deleteSender);

module.exports = router;