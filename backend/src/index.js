const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const prisma = require('./lib/prisma');

// Import routes 
const authRoutes = require('./routes/authRoutes');
const containerRoutes = require('./routes/containerRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const debugRoutes = require('./routes/debugRoutes');
const ownerRoutes = require('./routes/ownerRoutes');
const reportRoutes = require('./routes/reportRoutes');  
const employeeRoutes = require('./routes/employeeRoutes');
const exportRoutes = require('./routes/exportRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes - MAKE SURE EACH IS A ROUTER, NOT AN OBJECT
app.use('/api/auth', authRoutes);
app.use('/api/containers', containerRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/debug', debugRoutes);
app.use('/api/owners', ownerRoutes);
app.use('/api/reports', reportRoutes);  
app.use('/api/employees', employeeRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'WaterFlow API is running',
    timestamp: new Date().toISOString()
  });
});

// Test DB
app.get('/test-db', async (req, res) => {
  try {
    const count = await prisma.business.count();
    res.json({ 
      success: true, 
      message: 'Database connected successfully',
      businessCount: count 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
});