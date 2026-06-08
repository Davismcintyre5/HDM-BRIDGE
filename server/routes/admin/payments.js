const router = require('express').Router();
const { getTransactions, getTransactionById, processRefund, createManualInvoice, getSubscriptions } = require('../../controllers/admin/adminPaymentController');
const { adminAuth, checkPermission } = require('../../middleware/admin/adminAuth');
const { auditLog } = require('../../middleware/admin/adminAudit');

router.get('/', adminAuth, checkPermission('payments.view'), getTransactions);
router.get('/:id', adminAuth, checkPermission('payments.view'), getTransactionById);
router.post('/:id/refund', adminAuth, checkPermission('payments.refund'), auditLog('refund', 'payment'), processRefund);
router.post('/manual', adminAuth, checkPermission('payments.manual'), auditLog('manual_invoice', 'payment'), createManualInvoice);
router.get('/subscriptions/all', adminAuth, checkPermission('payments.view'), getSubscriptions);

module.exports = router;