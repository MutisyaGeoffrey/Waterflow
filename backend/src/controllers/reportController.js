const prisma = require('../lib/prisma');

const getWeeklyReport = async (req, res) => {
  try {
    const { businessId } = req.params;
    
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const transactions = await prisma.transaction.findMany({
      where: {
        businessId,
        createdAt: {
          gte: weekAgo,
          lte: today
        }
      }
    });
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyData = days.map((day, index) => {
      const dayTransactions = transactions.filter(t => {
        const transactionDay = new Date(t.createdAt).getDay();
        return transactionDay === index;
      });
      
      const totalLiters = dayTransactions.reduce((sum, t) => sum + t.totalLiters, 0);
      const totalRevenue = dayTransactions.reduce((sum, t) => sum + t.totalPrice, 0);
      
      return {
        day,
        liters: totalLiters,
        revenue: totalRevenue,
        transactionCount: dayTransactions.length
      };
    });
    
    res.json({
      success: true,
      data: weeklyData
    });
    
  } catch (error) {
    console.error('Weekly report error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch weekly report'
    });
  }
};

const getEmployeePerformance = async (req, res) => {
  try {
    const { businessId } = req.params;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const employees = await prisma.employee.findMany({
      where: { businessId, isActive: true },
      include: {
        transactions: {
          where: {
            createdAt: {
              gte: today,
              lt: tomorrow
            }
          }
        }
      }
    });
    
    const performance = employees.map(emp => ({
      id: emp.id,
      name: emp.name,
      pinCode: emp.pinCode,
      todaySales: emp.transactions.length,
      revenue: emp.transactions.reduce((sum, t) => sum + t.totalPrice, 0),
      liters: emp.transactions.reduce((sum, t) => sum + t.totalLiters, 0)
    }));
    
    performance.sort((a, b) => b.todaySales - a.todaySales);
    
    res.json({
      success: true,
      data: performance
    });
    
  } catch (error) {
    console.error('Employee performance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch employee performance'
    });
  }
};

// NEW FUNCTION - WhatsApp Report Generator
const sendWhatsAppReport = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { phoneNumber } = req.body;
    
    // Get today's start and end
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get all transactions for today
    const transactions = await prisma.transaction.findMany({
      where: {
        businessId,
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      },
      include: {
        employee: true
      }
    });
    
    // Calculate summary
    const totalLiters = transactions.reduce((sum, t) => sum + t.totalLiters, 0);
    const totalRevenue = transactions.reduce((sum, t) => sum + t.totalPrice, 0);
    const cashTotal = transactions.filter(t => t.paymentMethod === 'cash').reduce((sum, t) => sum + t.totalPrice, 0);
    const mpesaTotal = transactions.filter(t => t.paymentMethod === 'mpesa').reduce((sum, t) => sum + t.totalPrice, 0);
    const pickupCount = transactions.filter(t => t.serviceType === 'pickup').length;
    const deliveryCount = transactions.filter(t => t.serviceType === 'delivery').length;
    
    // Get business name
    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });
    
    // Format date for Kenya (DD/MM/YYYY)
    const date = new Date().toLocaleDateString('en-KE');
    const time = new Date().toLocaleTimeString('en-KE');
    
    // Create WhatsApp message with formatting
    const message = `💧 *WaterFlow Daily Report* 💧\n\n` +
      `*Business:* ${business.name}\n` +
      `*Date:* ${date}\n` +
      `*Time:* ${time}\n\n` +
      `📊 *TODAY'S SUMMARY* 📊\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `💧 Total Liters: *${totalLiters}L*\n` +
      `💰 Total Revenue: *KES ${totalRevenue}*\n` +
      `💵 Cash: KES ${cashTotal}\n` +
      `📱 M-Pesa: KES ${mpesaTotal}\n` +
      `🚚 Pickups: ${pickupCount}\n` +
      `🚛 Deliveries: ${deliveryCount}\n` +
      `📝 Transactions: ${transactions.length}\n\n` +
      `*Sent from WaterFlow Business Management System*`;
    
    // Encode for WhatsApp URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    res.json({
      success: true,
      data: {
        message,
        whatsappUrl,
        summary: {
          totalLiters,
          totalRevenue,
          cashTotal,
          mpesaTotal,
          pickupCount,
          deliveryCount,
          transactionCount: transactions.length
        }
      }
    });
    
  } catch (error) {
    console.error('WhatsApp report error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate WhatsApp report'
    });
  }
};

module.exports = {
  getWeeklyReport,
  getEmployeePerformance,
  sendWhatsAppReport  
};