const prisma = require('../config/db');

// Admin: get all users
exports.getAll = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true, role: true, status: true,
        createdAt: true, _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// Admin: update user role
exports.updateRole = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { role } = req.body;
    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true, status: true },
    });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Admin: block/unblock user
exports.updateStatus = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    const user = await prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, name: true, email: true, role: true, status: true },
    });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Admin: delete user
exports.remove = async (req, res, next) => {
  try {
    const id = req.params.id;
    await prisma.user.delete({ where: { id } });
    res.json({ message: 'User deleted.' });
  } catch (error) {
    next(error);
  }
};

// User: manage addresses
exports.getAddresses = async (req, res, next) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: { isDefault: 'desc' },
    });
    res.json(addresses);
  } catch (error) {
    next(error);
  }
};

exports.addAddress = async (req, res, next) => {
  try {
    const { street, city, state, zipCode, country, isDefault } = req.body;

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: req.user.id,
        street, city, state, zipCode, country,
        isDefault: isDefault || false,
      },
    });
    res.status(201).json(address);
  } catch (error) {
    next(error);
  }
};

exports.deleteAddress = async (req, res, next) => {
  try {
    const id = req.params.id;
    await prisma.address.delete({ where: { id } });
    res.json({ message: 'Address deleted.' });
  } catch (error) {
    next(error);
  }
};
