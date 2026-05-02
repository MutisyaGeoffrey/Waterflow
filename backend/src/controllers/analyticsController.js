const prisma = require('../lib/prisma');

const getAnalytics = async (req, res) => {
  try {
    const { businessId } = req.params;

    // 1. Total revenue and total liters
    const totals = await prisma.transaction.aggregate({
      where: { businessId },
      _sum: { totalPrice: true, totalLiters: true },
      _count: true
    });

    const totalRevenue = totals._sum.totalPrice || 0;
    const totalLiters = totals._sum.totalLiters || 0;
    const transactionCount = totals._count;

    // 2. Cash vs M-Pesa split
    const paymentSplit = await prisma.transaction.groupBy({
      by: ['paymentMethod'],
      where: { businessId },
      _sum: { totalPrice: true }
    });

    let cashTotal = 0, mpesaTotal = 0;
    paymentSplit.forEach(item => {
      if (item.paymentMethod === 'cash') cashTotal = item._sum.totalPrice || 0;
      if (item.paymentMethod === 'mpesa') mpesaTotal = item._sum.totalPrice || 0;
    });

    // 3. Top container by liters (not quantity)
    const topContainerRaw = await prisma.transaction.groupBy({
      by: ['containerSizeId'],
      where: { businessId },
      _sum: { totalLiters: true },
      orderBy: { _sum: { totalLiters: 'desc' } },
      take: 1
    });

    let topContainerName = 'N/A';
    if (topContainerRaw.length > 0) {
      const container = await prisma.containerSize.findUnique({
        where: { id: topContainerRaw[0].containerSizeId }
      });
      topContainerName = container ? `${container.sizeLiters}L` : 'Unknown';
    }

    // 4. Best employee (by total revenue)
    const bestEmployeeRaw = await prisma.transaction.groupBy({
      by: ['employeeId'],
      where: { businessId },
      _sum: { totalPrice: true },
      orderBy: { _sum: { totalPrice: 'desc' } },
      take: 1
    });

    let bestEmployeeName = 'N/A';
    if (bestEmployeeRaw.length > 0) {
      const employee = await prisma.employee.findUnique({
        where: { id: bestEmployeeRaw[0].employeeId }
      });
      bestEmployeeName = employee ? employee.name : 'Unknown';
    }

    // 5. Peak hour (bonus – when most transactions happen)
    const transactions = await prisma.transaction.findMany({
      where: { businessId },
      select: { createdAt: true }
    });

    const hourCounts = {};
    transactions.forEach(t => {
      const hour = new Date(t.createdAt).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    let peakHour = null;
    let maxCount = 0;
    for (const [hour, count] of Object.entries(hourCounts)) {
      if (count > maxCount) {
        maxCount = count;
        peakHour = hour;
      }
    }

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalLiters,
        transactionCount,
        topContainer: topContainerName,
        bestEmployee: bestEmployeeName,
        cashTotal,
        mpesaTotal,
        peakHour: peakHour !== null ? `${peakHour}:00` : null
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
  }
};

module.exports = { getAnalytics };