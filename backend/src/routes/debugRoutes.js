const express = require('express');
const { debugBusiness } = require('../controllers/debugController');

const router = express.Router();

router.get('/business/:businessId', debugBusiness);

module.exports = router;