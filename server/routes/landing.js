const router = require('express').Router();
const {
  getSettings,
  getPlans,
  getFeatures,
  getSmsConfig,
  getLegalDocument,
  getFeatureFlags,
  landingChat,
} = require('../controllers/client/landingController');

router.get('/settings', getSettings);
router.get('/plans', getPlans);
router.get('/features', getFeatures);
router.get('/sms-config', getSmsConfig);
router.get('/legal/:type', getLegalDocument);
router.get('/feature-flags', getFeatureFlags);
router.post('/chat', landingChat);

module.exports = router;