const prisma = require('../lib/prisma');

const debugBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;

    // Get business details
    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });

    // Get all employees
    const employees = await prisma.employee.findMany({
      where: { businessId }
    });

    // Get all container sizes
    const containers = await prisma.containerSize.findMany({
      where: { businessId }
    });

    res.json({
      success: true,
      data: {
        business,
        employees: employees.map(e => ({
          id: e.id,
          name: e.name,
          pinCode: e.pinCode
        })),
        containers: containers.map(c => ({
          id: c.id,
          sizeLiters: c.sizeLiters,
          pricePerLiter: c.pricePerLiter
        }))
      }
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { debugBusiness };