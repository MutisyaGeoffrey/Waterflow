const express = require('express');
const { 
  createTransaction, 
  getTodayTransactions,
  getTransactionHistory,
  getTransactionById
} = require('../controllers/transactionController');

const router = express.Router();

// Create a new transaction
router.post('/', createTransaction);

// Get today's transactions for a business
router.get('/today/:businessId', getTodayTransactions);

// Get transaction history with filters
router.get('/history/:businessId', getTransactionHistory);

// Get single transaction by ID
router.get('/:id', getTransactionById);

module.exports = router;