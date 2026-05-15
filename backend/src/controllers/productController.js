const prisma = require('../config/db');

exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, category, sort, search, featured, minPrice, maxPrice } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (category) where.category = { slug: category };
    if (search) where.title = { contains: search };
    if (featured === 'true') where.isFeatured = true;
    if (minPrice) where.price = { ...where.price, gte: parseFloat(minPrice) };
    if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice) };

    let orderBy = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    else if (sort === 'price_desc') orderBy = { price: 'desc' };
    else if (sort === 'newest') orderBy = { createdAt: 'desc' };
    else if (sort === 'rating') orderBy = { rating: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { select: { id: true, url: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        pages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getBySlug = async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { select: { id: true, url: true } },
        reviews: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) return res.status(404).json({ message: 'Product not found.' });

    // Get related products
    const related = await prisma.product.findMany({
      where: { categoryId: product.categoryId, id: { not: product.id } },
      take: 8,
      include: {
        images: { select: { id: true, url: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    res.json({ product, related });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { title, slug, description, price, discount, stock, brand, rating, categoryId, isFeatured } = req.body;

    const product = await prisma.product.create({
      data: {
        title,
        slug,
        description: description || '',
        price: parseFloat(price),
        discount: parseFloat(discount || 0),
        stock: parseInt(stock || 0),
        brand: brand || null,
        rating: parseFloat(rating || 0),
        categoryId: parseInt(categoryId),
        isFeatured: isFeatured === 'true' || isFeatured === true,
      },
      include: { category: true, images: true },
    });

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      const imageData = req.files.map((file) => ({
        url: `/uploads/${file.filename}`,
        productId: product.id,
      }));
      await prisma.productImage.createMany({ data: imageData });
    }

    const fullProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: { category: true, images: true },
    });

    res.status(201).json(fullProduct);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { title, slug, description, price, discount, stock, brand, rating, categoryId, isFeatured } = req.body;

    const data = {};
    if (title !== undefined) data.title = title;
    if (slug !== undefined) data.slug = slug;
    if (description !== undefined) data.description = description;
    if (price !== undefined) data.price = parseFloat(price);
    if (discount !== undefined) data.discount = parseFloat(discount);
    if (stock !== undefined) data.stock = parseInt(stock);
    if (brand !== undefined) data.brand = brand;
    if (rating !== undefined) data.rating = parseFloat(rating);
    if (categoryId !== undefined) data.categoryId = parseInt(categoryId);
    if (isFeatured !== undefined) data.isFeatured = isFeatured === 'true' || isFeatured === true;

    const product = await prisma.product.update({
      where: { id },
      data,
    });

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const imageData = req.files.map((file) => ({
        url: `/uploads/${file.filename}`,
        productId: product.id,
      }));
      await prisma.productImage.createMany({ data: imageData });
    }

    const fullProduct = await prisma.product.findUnique({
      where: { id },
      include: { category: true, images: true },
    });

    res.json(fullProduct);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Product deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

exports.deleteImage = async (req, res, next) => {
  try {
    const id = parseInt(req.params.imageId);
    await prisma.productImage.delete({ where: { id } });
    res.json({ message: 'Image deleted.' });
  } catch (error) {
    next(error);
  }
};
