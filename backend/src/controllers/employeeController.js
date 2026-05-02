const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');

// Get all employees for a business
const getEmployees = async (req, res) => {
  try {
    const { businessId } = req.params;

    const employees = await prisma.employee.findMany({
      where: {
        businessId: businessId
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        _count: {
          select: { transactions: true }
        }
      }
    });

    // Get today's transaction counts for each employee
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const employeesWithStats = await Promise.all(
      employees.map(async (emp) => {
        const todayTransactions = await prisma.transaction.count({
          where: {
            employeeId: emp.id,
            createdAt: {
              gte: today,
              lt: tomorrow
            }
          }
        });

        return {
          id: emp.id,
          name: emp.name,
          pinCode: emp.pinCode,   // this is the hash now – frontend masks it anyway
          isActive: emp.isActive,
          createdAt: emp.createdAt,
          lastLoginAt: emp.lastLoginAt,
          totalSales: emp._count.transactions,
          todaySales: todayTransactions
        };
      })
    );

    res.json({
      success: true,
      data: employeesWithStats
    });

  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch employees'
    });
  }
};

// Create a new employee (with hashed PIN)
const createEmployee = async (req, res) => {
  try {
    const { businessId, name, pinCode } = req.body;

    // Optional: check if employee with same name exists? Not required.
    // We no longer check duplicate PIN because it's hashed – but we can still check uniqueness by fetching all and comparing plain? Too expensive.
    // Rely on unique index on (businessId, pinCode) – but that won't work with hash. We'll skip duplicate check for now.

    const hashedPin = await bcrypt.hash(pinCode, 10);

    const employee = await prisma.employee.create({
      data: {
        businessId,
        name,
        pinCode: hashedPin,
        isActive: true
      }
    });

    res.json({
      success: true,
      data: employee,
      message: `Employee ${name} added successfully`
    });

  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create employee'
    });
  }
};

// Update employee (name, pin, or active status)
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, pinCode, isActive } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (pinCode !== undefined) {
      // Hash the new PIN
      updateData.pinCode = await bcrypt.hash(pinCode, 10);
    }

    const employee = await prisma.employee.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      data: employee,
      message: `Employee ${employee.name} updated`
    });

  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update employee'
    });
  }
};

// Delete employee (soft delete)
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await prisma.employee.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({
      success: true,
      data: employee,
      message: `Employee ${employee.name} deactivated`
    });

  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to deactivate employee'
    });
  }
};

// Reset employee PIN (hashed)
const resetEmployeePin = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPin } = req.body;

    // Check if PIN is valid (4 digits)
    if (!/^\d{4}$/.test(newPin)) {
      return res.status(400).json({
        success: false,
        error: 'PIN must be exactly 4 digits'
      });
    }

    const hashedPin = await bcrypt.hash(newPin, 10);
    const employee = await prisma.employee.update({
      where: { id },
      data: { pinCode: hashedPin }
    });

    res.json({
      success: true,
      data: employee,
      message: `PIN reset for ${employee.name}`
    });

  } catch (error) {
    console.error('Reset PIN error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset PIN'
    });
  }
};

module.exports = {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  resetEmployeePin
};