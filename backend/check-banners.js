const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.banner.findMany().then(b => { console.log(b); prisma.$disconnect(); });
