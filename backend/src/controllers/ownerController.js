const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const ownerLogin = async (req, res) => {
  try {
    const { phone, pinCode } = req.body;

    // Find owner by phone only (PIN will be compared after)
    const owner = await prisma.owner.findFirst({
      where: {
        phone: phone
      },
      include: {
        business: true
      }
    });

    if (!owner) {
      return res.status(401).json({
        success: false,
        error: 'Invalid phone or PIN'
      });
    }

    // Compare provided PIN with stored hash
    const isMatch = await bcrypt.compare(pinCode, owner.pinCode);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid phone or PIN'
      });
    }

    // Update last login time
    await prisma.owner.update({
      where: { id: owner.id },
      data: { lastLoginAt: new Date() }
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        ownerId: owner.id,
        businessId: owner.businessId,
        name: owner.name
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      data: {
        token,
        owner: {
          id: owner.id,
          name: owner.name,
          phone: owner.phone,
          business: {
            id: owner.business.id,
            name: owner.business.name
          }
        }
      }
    });

  } catch (error) {
    console.error('Owner login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
};

module.exports = {
  ownerLogin
};