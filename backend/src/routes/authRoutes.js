const express = require('express');
const { employeeLogin } = require('../controllers/authController');

const router = express.Router();

// Employee login
router.post('/employee/login', employeeLogin);

module.exports = router;