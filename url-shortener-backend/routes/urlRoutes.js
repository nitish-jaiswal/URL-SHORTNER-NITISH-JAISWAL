// routes/urlRoutes.js
const express = require('express');
const router = express.Router();
const urlController = require('../controllers/urlController');
const validate = require('../middlewares/validateMiddleware');
const auth = require('../middlewares/authMiddleware');

router.post('/shorten', auth, urlController.validateShorten, validate, urlController.shorten);

router.get('/me', auth, urlController.getUserUrls);

router.get('/:shortCode/analytics', auth, urlController.getAnalytics);

router.get('/:shortCode', urlController.redirect);

module.exports = router;
