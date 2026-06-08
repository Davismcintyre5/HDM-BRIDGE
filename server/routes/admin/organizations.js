const router = require('express').Router();
const { getOrganizations, getOrganizationById } = require('../../controllers/admin/adminUserController');
const { adminAuth, checkPermission } = require('../../middleware/admin/adminAuth');

router.get('/', adminAuth, checkPermission('users.view'), getOrganizations);
router.get('/:id', adminAuth, checkPermission('users.view'), getOrganizationById);

module.exports = router;