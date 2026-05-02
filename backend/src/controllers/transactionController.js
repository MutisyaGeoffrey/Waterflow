const prisma = require('../lib/prisma');

// Create a new transaction (sale)
const createTransaction = async (req, res) => {
  try {
    const { 
      employeeId, 
      businessId, 
      containerSizeId, 
      quantity, 
      paymentMethod, 
      serviceType,
      mpesaReference 
    } = req.body;

    // Get container size details to calculate totals
    const containerSize = await prisma.containerSize.findUnique({
      where: { id: containerSizeId }
    });

    if (!containerSize) {
      return res.status(400).json({
        success: false,
        error: 'Invalid container size'
      });
    }

    // Calculate totals
    const totalLiters = containerSize.sizeLiters * quantity;
    const totalPrice = totalLiters * containerSize.pricePerLiter;

    // Create the transaction
    const transaction = await prisma.transaction.create({
      data: {
        businessId,
        employeeId,
        containerSizeId,
        quantity,
        totalLiters,
        totalPrice,
        paymentMethod,
        serviceType,
        mpesaReference: paymentMethod === 'mpesa' ? mpesaReference : null,
      },
      include: {
        containerSize: true,
        employee: {
          select: { name: true }
        }
      }
    });

    res.json({
      success: true,
      data: {
        id: transaction.id,
        totalLiters: transaction.totalLiters,
        totalPrice: transaction.totalPrice,
        paymentMethod: transaction.paymentMethod,
        serviceType: transaction.serviceType,
        containerSize: transaction.containerSize.sizeLiters,
        quantity: transaction.quantity,
        employee: transaction.employee.name,
        createdAt: transaction.createdAt
      }
    });

  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record transaction'
    });
  }
};

// Get today's transactions for a business
const getTodayTransactions = async (req, res) => {
  try {
    const { businessId } = req.params;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const transactions = await prisma.transaction.findMany({
      where: {
        businessId,
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      },
      include: {
        containerSize: true,
        employee: {
          select: { name: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate summaries
    const summary = transactions.reduce((acc, t) => {
      acc.totalLiters += t.totalLiters;
      acc.totalRevenue += t.totalPrice;
      
      if (t.paymentMethod === 'cash') acc.cashTotal += t.totalPrice;
      else acc.mpesaTotal += t.totalPrice;
      
      if (t.serviceType === 'pickup') acc.pickupCount++;
      else acc.deliveryCount++;
      
      return acc;
    }, {
      totalLiters: 0,
      totalRevenue: 0,
      cashTotal: 0,
      mpesaTotal: 0,
      pickupCount: 0,
      deliveryCount: 0,
      transactionCount: transactions.length
    });

    res.json({
      success: true,
      data: {
        summary,
        transactions: transactions.map(t => ({
          id: t.id,
          liters: t.totalLiters,
          price: t.totalPrice,
          paymentMethod: t.paymentMethod,
          serviceType: t.serviceType,
          containerSize: t.containerSize.sizeLiters,
          quantity: t.quantity,
          employee: t.employee.name,
          time: t.createdAt
        }))
      }
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions'
    });
  }
};
// Get transaction history with filters
const getTransactionHistory = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { 
      startDate, 
      endDate, 
      employeeId, 
      paymentMethod, 
      serviceType,
      page = 1,
      limit = 20
    } = req.query;

    // Build where clause
    const where = { businessId };
    
    // Date range filter
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    
    // Employee filter
    if (employeeId) where.employeeId = employeeId;
    
    // Payment method filter
    if (paymentMethod) where.paymentMethod = paymentMethod;
    
    // Service type filter
    if (serviceType) where.serviceType = serviceType;

    // Get total count for pagination
    const totalCount = await prisma.transaction.count({ where });
    
    // Get transactions with pagination
    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        employee: {
          select: { name: true }
        },
        containerSize: {
          select: { sizeLiters: true, pricePerLiter: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: parseInt(limit)
    });

    // Format transactions for frontend
    const formattedTransactions = transactions.map(t => ({
      id: t.id,
      date: t.createdAt,
      employeeName: t.employee.name,
      containerSize: t.containerSize.sizeLiters,
      quantity: t.quantity,
      totalLiters: t.totalLiters,
      totalPrice: t.totalPrice,
      paymentMethod: t.paymentMethod,
      serviceType: t.serviceType,
      mpesaReference: t.mpesaReference
    }));

    res.json({
      success: true,
      data: {
        transactions: formattedTransactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      }
    });

  } catch (error) {
    console.error('Transaction history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transaction history'
    });
  }
};

// Get transaction by ID
const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        employee: {
          select: { name: true }
        },
        containerSize: {
          select: { sizeLiters: true, pricePerLiter: true }
        }
      }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: transaction.id,
        date: transaction.createdAt,
        employeeName: transaction.employee.name,
        containerSize: transaction.containerSize.sizeLiters,
        quantity: transaction.quantity,
        totalLiters: transaction.totalLiters,
        totalPrice: transaction.totalPrice,
        paymentMethod: transaction.paymentMethod,
        serviceType: transaction.serviceType,
        mpesaReference: transaction.mpesaReference
      }
    });

  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transaction'
    });
  }
};
module.exports = {
  createTransaction,
  getTodayTransactions,
  getTransactionHistory,  
  getTransactionById      
};