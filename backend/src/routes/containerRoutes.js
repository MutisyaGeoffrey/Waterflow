const express = require('express');
const { 
  getContainerSizes, 
  createContainerSize, 
  updateContainerSize, 
  deleteContainerSize 
} = require('../controllers/containerController');

const router = express.Router();

// Get all containers for a business
router.get('/:businessId', getContainerSizes);

// Create new container
router.post('/', createContainerSize);

// Update container
router.put('/:id', updateContainerSize);

// Delete container (soft delete)
router.delete('/:id', deleteContainerSize);

module.exports = router;