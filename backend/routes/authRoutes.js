'use strict';

const express    = require('express');
const router     = express.Router();

const authCtrl   = require('../controllers/authController');
const { registerRules, loginRules, upgradeProRules, updateProfileRules, validate } = require('../middlewares/validation');
const { authenticate } = require('../middlewares/auth');

router.post('/register',       registerRules,    validate, authCtrl.register);
router.post('/login',          loginRules,       validate, authCtrl.login);
router.post('/forgot-password',                            authCtrl.forgotPassword);
router.post('/reset-password',                             authCtrl.resetPassword);
router.get ('/me',             authenticate,               authCtrl.getMe);
router.post('/upgrade-pro',    authenticate, upgradeProRules, validate, authCtrl.upgradePro);

module.exports = router;
