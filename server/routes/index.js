const router = require('express').Router();

const clientRoutes = require('./client/index');
const adminRoutes = require('./admin/index');
const trackingRoutes = require('./tracking');
const { stripeWebhook, mpesaCallback, paypalWebhook } = require('../controllers/client/paymentController');

router.use('/api', clientRoutes);
router.use('/admin/api', adminRoutes);
router.use('/api/track', trackingRoutes);

router.post('/api/payments/stripe/webhook', stripeWebhook);
router.post('/api/payments/mpesa/callback', mpesaCallback);
router.post('/api/payments/paypal/webhook', paypalWebhook);

module.exports = router;