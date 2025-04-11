const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middlewares/validateMiddleware');

router.post('/register', authController.validateRegister, validate, authController.register);
router.post('/login', authController.validateLogin, validate, authController.login);

module.exports = router;
