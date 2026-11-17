const Plan = require('../../models/client/Plan');
const AIWidgetSetting = require('../../models/admin/AIWidgetSetting');
const SystemSetting = require('../../models/admin/SystemSetting');
const LegalDocument = require('../../models/admin/LegalDocument');
const aiService = require('../../services/aiService');
const currencyService = require('../../services/currencyService');
const smsPricingService = require('../../services/smsPricingService');
const { isSmsEnabled } = require('../../middleware/common/smsGate');
const logger = require('../../utils/logger');

const getSettings = async (req, res) => {
  try {
    const settings = await SystemSetting.find({ isPublic: true });
    const settingsObj = {};
    settings.forEach((s) => { settingsObj[s.key] = s.value; });
    res.status(200).json({ success: true, settings: settingsObj });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true, isPublic: true }).sort('metadata.sortOrder');
    const defaultCurrency = await currencyService.getGlobalDefaultCode();

    const enriched = await Promise.all(plans.map(async (plan) => {
      const amount = await currencyService.convertPrice(
        plan.price.amount,
        plan.price.currency || 'USD',
        defaultCurrency
      );
      const formatted = await currencyService.formatPrice(amount, defaultCurrency);
      return {
        ...plan.toJSON(),
        convertedPrice: { amount, currency: defaultCurrency, formatted },
      };
    }));

    res.status(200).json({ success: true, plans: enriched, currency: defaultCurrency });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getFeatures = async (req, res) => {
  const features = [
    { icon: '🔑', title: 'API Keys in Seconds', description: 'Create API keys instantly. Start sending emails and SMS with a single curl command.' },
    { icon: '📱', title: 'SMS API', description: 'Send transactional SMS with prepaid per-message billing. Real-time delivery tracking.' },
    { icon: '📊', title: 'Real-time Tracking', description: 'Monitor opens, clicks, bounces, and SMS delivery status.' },
    { icon: '🌐', title: 'Domain Verification', description: 'Verify domains with SPF, DKIM, and DMARC.' },
    { icon: '📝', title: 'Email Templates', description: 'Create reusable HTML templates with variables.' },
    { icon: '🔔', title: 'Webhooks', description: 'Real-time notifications for email and SMS events.' },
    { icon: '🛡️', title: 'Spam Protection', description: 'Built-in rate limiting and compliance checks.' },
  ];
  res.status(200).json({ success: true, features });
};

const getSmsConfig = async (req, res) => {
  try {
    const [rateKes, enabled] = await Promise.all([
      smsPricingService.getRate(),
      isSmsEnabled(),
    ]);
    res.status(200).json({
      success: true,
      config: { rateKes, enabled },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getLegalDocument = async (req, res) => {
  try {
    const { type } = req.params;
    const allowed = ['terms_of_service', 'privacy_policy', 'cookie_policy', 'gdpr'];
    if (!allowed.includes(type)) {
      return res.status(400).json({ success: false, error: 'Invalid document type' });
    }

    const doc = await LegalDocument.findOne({
      type,
      isPublished: true,
    }).sort({ version: -1 }).lean();

    if (!doc) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    res.status(200).json({
      success: true,
      document: {
        type: doc.type,
        title: doc.title,
        content: doc.content,
        version: doc.version,
        effectiveDate: doc.effectiveDate,
        updatedAt: doc.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getFeatureFlags = async (req, res) => {
  try {
    const smsEnabled = await isSmsEnabled();
    res.status(200).json({
      success: true,
      flags: { smsEnabled },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const landingChat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ success: false, error: 'Message required' });

    const config = await AIWidgetSetting.findOne({ isActive: true, isEnabled: true });
    if (!config) return res.status(503).json({ success: false, error: 'Chat unavailable' });

    const systemPrompt = 'You are HDM BRIDGE Assistant. Plans: Free (3K emails/mo), Pro (50K/mo, KSh 2,470), Pro+ (500K/mo, KSh 10,270). We also offer SMS at KSh 1/SMS via prepaid wallet. Features: API keys, domain verification, templates, tracking, webhooks, SMS API. Contact: support@hdmbridge.com. Keep responses short and friendly.';

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ];

    let response;
    if (config.provider === 'openai') {
      response = await aiService.callOpenAI(messages, config);
    } else if (config.provider === 'groq') {
      response = await aiService.callGroq(messages, config);
    } else {
      response = await aiService.callHDM(messages, config);
    }

    res.status(200).json({ success: true, reply: response.content });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getSettings,
  getPlans,
  getFeatures,
  getSmsConfig,
  getLegalDocument,
  getFeatureFlags,
  landingChat,
};