const express = require('express');
const { getAnalytics } = require('../controllers/analyticsController');

const router = express.Router();

router.get('/:businessId', getAnalytics);

module.exports = router;