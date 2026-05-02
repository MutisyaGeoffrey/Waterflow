const express = require('express');
const { ownerLogin } = require('../controllers/ownerController');

const router = express.Router();

router.post('/login', ownerLogin);

module.exports = router;