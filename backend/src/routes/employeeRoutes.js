const express = require('express');
const { 
  getEmployees, 
  createEmployee, 
  updateEmployee, 
  deleteEmployee,
  resetEmployeePin
} = require('../controllers/employeeController');

const router = express.Router();

// Get all employees for a business
router.get('/:businessId', getEmployees);

// Create new employee
router.post('/', createEmployee);

// Update employee
router.put('/:id', updateEmployee);

// Delete employee (soft delete)
router.delete('/:id', deleteEmployee);

// Reset employee PIN
router.post('/:id/reset-pin', resetEmployeePin);

module.exports = router;