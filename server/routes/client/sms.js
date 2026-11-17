const router = require('express').Router();
const {
  sendSms,
  getLogs,
  getStats,
  getWallet,
  createTopup,
  getTopupStatus,
} = require('../../controllers/client/smsController');
const apiKeyAuth = require('../../middleware/common/apiKeyAuth');
const auth = require('../../middleware/common/auth');
const tenantIsolation = require('../../middleware/common/tenantIsolation');
const { smsGate } = require('../../middleware/common/smsGate');

router.post('/send',    apiKeyAuth, tenantIsolation, smsGate, sendSms);
router.post('/compose', auth,       tenantIsolation, smsGate, sendSms);

router.get('/logs',   auth, tenantIsolation, getLogs);
router.get('/stats',  auth, tenantIsolation, getStats);
router.get('/wallet', auth, tenantIsolation, getWallet);

router.post('/topup',               auth, tenantIsolation, createTopup);
router.get('/topup/:transactionId', auth, tenantIsolation, getTopupStatus);

module.exports = router;