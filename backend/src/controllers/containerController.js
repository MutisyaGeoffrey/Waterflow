const prisma = require('../lib/prisma');

// Get all container sizes for a business
const getContainerSizes = async (req, res) => {
  try {
    const { businessId } = req.params;

    const containers = await prisma.containerSize.findMany({
      where: {
        businessId: businessId
      },
      orderBy: {
        sizeLiters: 'asc'
      }
    });

    res.json({
      success: true,
      data: containers
    });

  } catch (error) {
    console.error('Get containers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch container sizes'
    });
  }
};

// Create a new container size
const createContainerSize = async (req, res) => {
  try {
    const { businessId, sizeLiters, pricePerLiter } = req.body;

    // Check if container size already exists
    const existing = await prisma.containerSize.findUnique({
      where: {
        businessId_sizeLiters: {
          businessId: businessId,
          sizeLiters: sizeLiters
        }
      }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: `Container size ${sizeLiters}L already exists`
      });
    }

    const container = await prisma.containerSize.create({
      data: {
        businessId,
        sizeLiters,
        pricePerLiter
      }
    });

    res.json({
      success: true,
      data: container,
      message: `Added ${sizeLiters}L container`
    });

  } catch (error) {
    console.error('Create container error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create container size'
    });
  }
};

// Update container size (price or active status)
const updateContainerSize = async (req, res) => {
  try {
    const { id } = req.params;
    const { pricePerLiter, isActive } = req.body;

    const container = await prisma.containerSize.update({
      where: { id },
      data: {
        ...(pricePerLiter !== undefined && { pricePerLiter }),
        ...(isActive !== undefined && { isActive })
      }
    });

    res.json({
      success: true,
      data: container,
      message: `Updated ${container.sizeLiters}L container`
    });

  } catch (error) {
    console.error('Update container error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update container size'
    });
  }
};

// Delete container size (soft delete - set inactive)
const deleteContainerSize = async (req, res) => {
  try {
    const { id } = req.params;

    const container = await prisma.containerSize.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({
      success: true,
      data: container,
      message: `${container.sizeLiters}L container deactivated`
    });

  } catch (error) {
    console.error('Delete container error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to deactivate container size'
    });
  }
};

module.exports = {
  getContainerSizes,
  createContainerSize,
  updateContainerSize,
  deleteContainerSize
};