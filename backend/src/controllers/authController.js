const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

// Employee login with 4-digit PIN (bcrypt comparison)
const employeeLogin = async (req, res) => {
  try {
    const { pinCode, businessId } = req.body;

    // Find the first active employee for this business
    const employee = await prisma.employee.findFirst({
      where: {
        businessId: businessId,
        isActive: true
      }
    });

    if (!employee) {
      return res.status(401).json({
        success: false,
        error: 'Invalid business ID or PIN'
      });
    }

    // Compare provided PIN with stored hash
    const isMatch = await bcrypt.compare(pinCode, employee.pinCode);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid business ID or PIN'
      });
    }

    // Update last login time
    await prisma.employee.update({
      where: { id: employee.id },
      data: { lastLoginAt: new Date() }
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        employeeId: employee.id,
        businessId: employee.businessId,
        name: employee.name
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        employee: {
          id: employee.id,
          name: employee.name,
          businessId: employee.businessId
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
};

module.exports = {
  employeeLogin
};