const prisma = require('../lib/prisma');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// Export transactions as CSV
const exportToCSV = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { startDate, endDate, employeeId, paymentMethod, serviceType } = req.query;

    // Build where clause
    const where = { businessId };
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    if (employeeId) where.employeeId = employeeId;
    if (paymentMethod) where.paymentMethod = paymentMethod;
    if (serviceType) where.serviceType = serviceType;

    // Fetch transactions
    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        employee: { select: { name: true } },
        containerSize: { select: { sizeLiters: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get business info
    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });

    // Format CSV header
    const headers = [
      'Date',
      'Time',
      'Employee',
      'Container Size (L)',
      'Quantity',
      'Total Liters',
      'Total Price (KES)',
      'Payment Method',
      'Service Type',
      'M-Pesa Reference'
    ];

    // Format CSV rows
    const rows = transactions.map(t => [
      new Date(t.createdAt).toLocaleDateString('en-KE'),
      new Date(t.createdAt).toLocaleTimeString('en-KE'),
      t.employee.name,
      t.containerSize.sizeLiters,
      t.quantity,
      t.totalLiters,
      t.totalPrice,
      t.paymentMethod === 'cash' ? 'Cash' : 'M-Pesa',
      t.serviceType === 'pickup' ? 'Pickup' : 'Delivery',
      t.mpesaReference || ''
    ]);

    // Calculate totals
    const totals = {
      totalLiters: transactions.reduce((sum, t) => sum + t.totalLiters, 0),
      totalRevenue: transactions.reduce((sum, t) => sum + t.totalPrice, 0),
      totalTransactions: transactions.length
    };

    // Create CSV content
    let csvContent = `"WaterFlow Export Report"\n`;
    csvContent += `"Business: ${business.name}"\n`;
    csvContent += `"Generated: ${new Date().toLocaleString('en-KE')}"\n`;
    csvContent += `"Total Transactions: ${totals.totalTransactions}"\n`;
    csvContent += `"Total Liters: ${totals.totalLiters}"\n`;
    csvContent += `"Total Revenue: KES ${totals.totalRevenue}"\n`;
    csvContent += `\n`;
    
    // Add headers
    csvContent += headers.map(h => `"${h}"`).join(',') + '\n';
    
    // Add rows
    rows.forEach(row => {
      csvContent += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n';
    });

    // Set response headers for download
    const filename = `waterflow_export_${Date.now()}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);

  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export CSV'
    });
  }
};

// Export transactions as PDF
const exportToPDF = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { startDate, endDate, employeeId, paymentMethod, serviceType } = req.query;

    // Build where clause
    const where = { businessId };
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    if (employeeId) where.employeeId = employeeId;
    if (paymentMethod) where.paymentMethod = paymentMethod;
    if (serviceType) where.serviceType = serviceType;

    // Fetch transactions
    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        employee: { select: { name: true } },
        containerSize: { select: { sizeLiters: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get business info
    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });

    // Calculate totals
    const totals = {
      totalLiters: transactions.reduce((sum, t) => sum + t.totalLiters, 0),
      totalRevenue: transactions.reduce((sum, t) => sum + t.totalPrice, 0),
      cashTotal: transactions.filter(t => t.paymentMethod === 'cash').reduce((sum, t) => sum + t.totalPrice, 0),
      mpesaTotal: transactions.filter(t => t.paymentMethod === 'mpesa').reduce((sum, t) => sum + t.totalPrice, 0),
      pickupCount: transactions.filter(t => t.serviceType === 'pickup').length,
      deliveryCount: transactions.filter(t => t.serviceType === 'delivery').length
    };

    // Create PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    
    // Set response headers
    const filename = `waterflow_report_${Date.now()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    doc.pipe(res);

    // Header
    doc.fontSize(24).font('Helvetica-Bold').fillColor('#2563eb').text('WaterFlow', { align: 'center' });
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#1e293b').text('Transaction Report', { align: 'center' });
    doc.moveDown(0.5);
    
    doc.fontSize(10).font('Helvetica').fillColor('#64748b');
    doc.text(`Business: ${business.name}`, { align: 'center' });
    doc.text(`Generated: ${new Date().toLocaleString('en-KE')}`, { align: 'center' });
    doc.moveDown(1);

    // Summary Section
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e293b').text('Summary', { underline: true });
    doc.moveDown(0.5);
    
    doc.fontSize(10).font('Helvetica');
    doc.text(`Total Transactions: ${transactions.length}`, { continued: true });
    doc.text(`Total Liters: ${totals.totalLiters}L`, { continued: true, align: 'right' });
    doc.moveDown(0.3);
    doc.text(`Total Revenue: KES ${totals.totalRevenue}`, { continued: true });
    doc.text(`Cash: KES ${totals.cashTotal} | M-Pesa: KES ${totals.mpesaTotal}`, { align: 'right' });
    doc.moveDown(0.3);
    doc.text(`Pickups: ${totals.pickupCount}`, { continued: true });
    doc.text(`Deliveries: ${totals.deliveryCount}`, { align: 'right' });
    doc.moveDown(1);

    // Transactions Table
    doc.fontSize(12).font('Helvetica-Bold').text('Transaction Details', { underline: true });
    doc.moveDown(0.5);

    // Table Headers
    const startX = 50;
    let currentY = doc.y;
    
    doc.fontSize(8).font('Helvetica-Bold');
    doc.text('Date', startX, currentY);
    doc.text('Time', startX + 80, currentY);
    doc.text('Employee', startX + 130, currentY);
    doc.text('Size', startX + 200, currentY);
    doc.text('Qty', startX + 250, currentY);
    doc.text('Liters', startX + 300, currentY);
    doc.text('Amount', startX + 360, currentY);
    doc.text('Method', startX + 430, currentY);
    
    currentY += 20;
    doc.moveTo(startX, currentY).lineTo(startX + 520, currentY).stroke();
    currentY += 5;

    // Table Rows
    doc.font('Helvetica');
    transactions.slice(0, 50).forEach(t => {
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }
      
      doc.text(new Date(t.createdAt).toLocaleDateString('en-KE'), startX, currentY);
      doc.text(new Date(t.createdAt).toLocaleTimeString('en-KE'), startX + 80, currentY);
      doc.text(t.employee.name.substring(0, 15), startX + 130, currentY);
      doc.text(`${t.containerSize.sizeLiters}L`, startX + 200, currentY);
      doc.text(t.quantity.toString(), startX + 250, currentY);
      doc.text(`${t.totalLiters}L`, startX + 300, currentY);
      doc.text(`KES ${t.totalPrice}`, startX + 360, currentY);
      doc.text(t.paymentMethod === 'cash' ? 'Cash' : 'M-Pesa', startX + 430, currentY);
      
      currentY += 20;
    });

    if (transactions.length > 50) {
      doc.fontSize(8).fillColor('#94a3b8');
      doc.text(`... and ${transactions.length - 50} more transactions. Export CSV for full list.`, startX, currentY + 10);
    }

    // Footer
    doc.fontSize(8).fillColor('#94a3b8');
    doc.text('Generated by WaterFlow Business Management System', 50, doc.page.height - 50, { align: 'center' });

    doc.end();

  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export PDF'
    });
  }
};

// Export daily summary as PDF
const exportDailySummary = async (req, res) => {
  try {
    const { businessId } = req.params;

    // Get today's transactions
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
        employee: true,
        containerSize: true
      }
    });

    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });

    // Calculate totals
    const totals = {
      totalLiters: transactions.reduce((sum, t) => sum + t.totalLiters, 0),
      totalRevenue: transactions.reduce((sum, t) => sum + t.totalPrice, 0),
      cashTotal: transactions.filter(t => t.paymentMethod === 'cash').reduce((sum, t) => sum + t.totalPrice, 0),
      mpesaTotal: transactions.filter(t => t.paymentMethod === 'mpesa').reduce((sum, t) => sum + t.totalPrice, 0),
      pickupCount: transactions.filter(t => t.serviceType === 'pickup').length,
      deliveryCount: transactions.filter(t => t.serviceType === 'delivery').length
    };

    // Group by employee
    const employeeStats = {};
    transactions.forEach(t => {
      if (!employeeStats[t.employee.name]) {
        employeeStats[t.employee.name] = { sales: 0, liters: 0, revenue: 0 };
      }
      employeeStats[t.employee.name].sales++;
      employeeStats[t.employee.name].liters += t.totalLiters;
      employeeStats[t.employee.name].revenue += t.totalPrice;
    });

    // Group by container size
    const containerStats = {};
    transactions.forEach(t => {
      const size = `${t.containerSize.sizeLiters}L`;
      if (!containerStats[size]) {
        containerStats[size] = { quantity: 0, liters: 0, revenue: 0 };
      }
      containerStats[size].quantity += t.quantity;
      containerStats[size].liters += t.totalLiters;
      containerStats[size].revenue += t.totalPrice;
    });

    // Create PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const filename = `daily_summary_${today.toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    doc.pipe(res);

    // Header
    doc.fontSize(24).font('Helvetica-Bold').fillColor('#2563eb').text('WaterFlow', { align: 'center' });
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#1e293b').text('Daily Summary Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').fillColor('#64748b');
    doc.text(`Business: ${business.name}`, { align: 'center' });
    doc.text(`Date: ${today.toLocaleDateString('en-KE')}`, { align: 'center' });
    doc.moveDown(1);

    // Main Summary
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#1e293b').text('Today\'s Performance', { underline: true });
    doc.moveDown(0.5);
    
    doc.fontSize(12).font('Helvetica');
    doc.text(`Total Transactions: ${transactions.length}`, { continued: true });
    doc.text(`Total Liters: ${totals.totalLiters}L`, { align: 'right' });
    doc.moveDown(0.3);
    doc.text(`Total Revenue: KES ${totals.totalRevenue}`, { continued: true });
    doc.text(`Cash: KES ${totals.cashTotal} | M-Pesa: KES ${totals.mpesaTotal}`, { align: 'right' });
    doc.moveDown(0.3);
    doc.text(`Pickups: ${totals.pickupCount}`, { continued: true });
    doc.text(`Deliveries: ${totals.deliveryCount}`, { align: 'right' });
    doc.moveDown(1);

    // Employee Performance
    doc.fontSize(12).font('Helvetica-Bold').text('Employee Performance', { underline: true });
    doc.moveDown(0.5);
    
    const empEntries = Object.entries(employeeStats);
    empEntries.forEach(([name, stats]) => {
      doc.fontSize(10).font('Helvetica');
      doc.text(`${name}: ${stats.sales} sales | ${stats.liters}L | KES ${stats.revenue}`);
    });
    doc.moveDown(1);

    // Container Size Analysis
    doc.fontSize(12).font('Helvetica-Bold').text('Container Size Analysis', { underline: true });
    doc.moveDown(0.5);
    
    const containerEntries = Object.entries(containerStats);
    containerEntries.forEach(([size, stats]) => {
      doc.fontSize(10).font('Helvetica');
      doc.text(`${size}: ${stats.quantity} units | ${stats.liters}L | KES ${stats.revenue}`);
    });
    doc.moveDown(1);

    // Footer
    doc.fontSize(8).fillColor('#94a3b8');
    doc.text('Generated by WaterFlow Business Management System', 50, doc.page.height - 50, { align: 'center' });

    doc.end();

  } catch (error) {
    console.error('Daily summary export error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export daily summary'
    });
  }
};

module.exports = {
  exportToCSV,
  exportToPDF,
  exportDailySummary
};