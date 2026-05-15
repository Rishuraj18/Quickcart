const prisma = require('../config/db');

exports.getActive = async (req, res, next) => {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(banners);
  } catch (error) {
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const banners = await prisma.banner.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(banners);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { title, linkUrl, isActive } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const banner = await prisma.banner.create({
      data: {
        title,
        imageUrl,
        linkUrl: linkUrl || null,
        isActive: isActive === 'true' || isActive === true,
      },
    });
    res.status(201).json(banner);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { title, linkUrl, isActive } = req.body;
    const data = {};
    if (title !== undefined) data.title = title;
    if (linkUrl !== undefined) data.linkUrl = linkUrl;
    if (isActive !== undefined) data.isActive = isActive === 'true' || isActive === true;
    if (req.file) data.imageUrl = `/uploads/${req.file.filename}`;

    const banner = await prisma.banner.update({ where: { id }, data });
    res.json(banner);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.banner.delete({ where: { id } });
    res.json({ message: 'Banner deleted.' });
  } catch (error) {
    next(error);
  }
};
