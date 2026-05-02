const express = require('express');
const { 
  getWeeklyReport, 
  getEmployeePerformance,
  sendWhatsAppReport  // IMPORT THE NEW FUNCTION
} = require('../controllers/reportController');

const router = express.Router();

router.get('/weekly/:businessId', getWeeklyReport);
router.get('/employees/:businessId', getEmployeePerformance);
router.post('/whatsapp/:businessId', sendWhatsAppReport);  // NEW ROUTE

module.exports = router;