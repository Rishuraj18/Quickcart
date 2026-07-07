const prisma = require('../config/db');

exports.create = async (req, res, next) => {
  try {
    const { productId, rating, comment } = req.body;

    const existing = await prisma.review.findFirst({
      where: { userId: req.user.id, productId },
    });
    if (existing) {
      return res.status(409).json({ message: 'You have already reviewed this product.' });
    }

    const review = await prisma.review.create({
      data: {
        userId: req.user.id,
        productId,
        rating: parseInt(rating),
        comment,
      },
      include: { user: { select: { id: true, name: true } } },
    });

    // Update product average rating
    const agg = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
    });
    await prisma.product.update({
      where: { id: productId },
      data: { rating: Math.round((agg._avg.rating || 0) * 10) / 10 },
    });

    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
};

exports.getByProduct = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

// Admin: get all reviews
exports.getAll = async (req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true } },
        product: { select: { id: true, title: true } },
      },
    });
    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

// Admin: delete review
exports.remove = async (req, res, next) => {
  try {
    const id = req.params.id;
    const review = await prisma.review.findUnique({ where: { id } });
    await prisma.review.delete({ where: { id } });

    // Update product rating
    if (review) {
      const agg = await prisma.review.aggregate({
        where: { productId: review.productId },
        _avg: { rating: true },
      });
      await prisma.product.update({
        where: { id: review.productId },
        data: { rating: Math.round((agg._avg.rating || 0) * 10) / 10 },
      });
    }

    res.json({ message: 'Review deleted.' });
  } catch (error) {
    next(error);
  }
};
