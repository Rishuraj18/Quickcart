const prisma = require('../config/db');

exports.getAll = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    });
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

exports.getBySlug = async (req, res, next) => {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: req.params.slug },
      include: { _count: { select: { products: true } } },
    });
    if (!category) return res.status(404).json({ message: 'Category not found.' });
    res.json(category);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, slug } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const category = await prisma.category.create({
      data: { name, slug, image },
    });
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { name, slug } = req.body;
    const data = {};
    if (name) data.name = name;
    if (slug) data.slug = slug;
    if (req.file) data.image = `/uploads/${req.file.filename}`;

    const category = await prisma.category.update({ where: { id }, data });
    res.json(category);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.category.delete({ where: { id } });
    res.json({ message: 'Category deleted.' });
  } catch (error) {
    next(error);
  }
};
