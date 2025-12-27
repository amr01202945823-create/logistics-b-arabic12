
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const activeSubscribers = await prisma.user.count({
      where: { subscriptionStatus: 'ACTIVE' }
    });
    const revenueAgg = await prisma.transaction.aggregate({
      where: { status: 'SUCCESS' },
      _sum: { amount: true }
    });
    
    res.json({
      totalUsers,
      activeSubscribers,
      totalRevenue: (revenueAgg._sum.amount || 0) / 100
    });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

// Manual Subscription Activation
exports.manualActivate = async (req, res) => {
  const { userId, planId } = req.body;
  try {
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.durationInDays);

    await prisma.$transaction([
      prisma.subscription.create({
        data: {
          userId,
          planId,
          endDate,
          status: 'ACTIVE'
        }
      }),
      prisma.user.update({
        where: { id: userId },
        data: { subscriptionStatus: 'ACTIVE' }
      })
    ]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to activate" });
  }
};
