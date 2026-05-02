const express = require('express');
const { 
  exportToCSV, 
  exportToPDF, 
  exportDailySummary 
} = require('../controllers/exportController');

const router = express.Router();

// Export as CSV
router.get('/csv/:businessId', exportToCSV);

// Export as PDF
router.get('/pdf/:businessId', exportToPDF);

// Export daily summary as PDF
router.get('/daily-summary/:businessId', exportDailySummary);

module.exports = router;