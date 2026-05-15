const prisma = require('../config/db');

exports.getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalProducts, totalOrders, salesAgg, recentOrders] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        where: { paymentStatus: 'COMPLETED' },
        _sum: { totalAmount: true },
      }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          items: { include: { product: { select: { title: true } } } },
        },
      }),
    ]);

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalSales: salesAgg._sum.totalAmount || 0,
      recentOrders,
    });
  } catch (error) {
    next(error);
  }
};
