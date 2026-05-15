const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@store.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@store.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create test user
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@store.com' },
    update: {},
    create: {
      name: 'Test User',
      email: 'user@store.com',
      password: userPassword,
      role: 'USER',
    },
  });
  console.log('✅ Test user created:', user.email);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'electronics' },
      update: {},
      create: { name: 'Electronics', slug: 'electronics' },
    }),
    prisma.category.upsert({
      where: { slug: 'fashion' },
      update: {},
      create: { name: 'Fashion', slug: 'fashion' },
    }),
    prisma.category.upsert({
      where: { slug: 'home-kitchen' },
      update: {},
      create: { name: 'Home & Kitchen', slug: 'home-kitchen' },
    }),
    prisma.category.upsert({
      where: { slug: 'books' },
      update: {},
      create: { name: 'Books', slug: 'books' },
    }),
    prisma.category.upsert({
      where: { slug: 'beauty' },
      update: {},
      create: { name: 'Beauty & Personal Care', slug: 'beauty' },
    }),
    prisma.category.upsert({
      where: { slug: 'sports' },
      update: {},
      create: { name: 'Sports & Outdoors', slug: 'sports' },
    }),
  ]);
  console.log('✅ Categories created:', categories.length);

  // Create sample products
  const products = [
    {
      title: 'Wireless Bluetooth Headphones',
      slug: 'wireless-bluetooth-headphones',
      description: 'Premium noise-cancelling wireless headphones with 40-hour battery life, deep bass, and crystal-clear audio. Perfect for music lovers and professionals.',
      price: 2999,
      discount: 15,
      stock: 50,
      brand: 'SoundMax',
      rating: 4.5,
      isFeatured: true,
      categoryId: categories[0].id,
    },
    {
      title: 'Smart Watch Pro',
      slug: 'smart-watch-pro',
      description: 'Advanced smartwatch with heart rate monitor, GPS tracking, 7-day battery life, and water resistance up to 50m.',
      price: 4999,
      discount: 10,
      stock: 30,
      brand: 'TechFit',
      rating: 4.3,
      isFeatured: true,
      categoryId: categories[0].id,
    },
    {
      title: 'Ultra HD 4K Monitor 27"',
      slug: 'ultra-hd-4k-monitor-27',
      description: '27-inch 4K UHD monitor with IPS panel, HDR10 support, and USB-C connectivity. Ideal for creative professionals.',
      price: 24999,
      discount: 20,
      stock: 15,
      brand: 'ViewPro',
      rating: 4.7,
      isFeatured: true,
      categoryId: categories[0].id,
    },
    {
      title: 'Premium Cotton T-Shirt',
      slug: 'premium-cotton-tshirt',
      description: '100% organic cotton t-shirt with a relaxed fit. Available in multiple colors. Breathable and comfortable for everyday wear.',
      price: 799,
      discount: 0,
      stock: 200,
      brand: 'UrbanWear',
      rating: 4.2,
      isFeatured: false,
      categoryId: categories[1].id,
    },
    {
      title: 'Slim Fit Denim Jeans',
      slug: 'slim-fit-denim-jeans',
      description: 'Classic slim-fit denim jeans with stretch fabric for maximum comfort. Durable and stylish for any occasion.',
      price: 1499,
      discount: 25,
      stock: 120,
      brand: 'DenimCo',
      rating: 4.0,
      isFeatured: true,
      categoryId: categories[1].id,
    },
    {
      title: 'Stainless Steel Water Bottle',
      slug: 'stainless-steel-water-bottle',
      description: 'Double-walled vacuum insulated water bottle. Keeps drinks cold for 24 hours or hot for 12 hours. BPA-free.',
      price: 599,
      discount: 10,
      stock: 300,
      brand: 'HydraLife',
      rating: 4.6,
      isFeatured: false,
      categoryId: categories[2].id,
    },
    {
      title: 'Non-Stick Cookware Set',
      slug: 'non-stick-cookware-set',
      description: '5-piece non-stick cookware set with heat-resistant handles. PFOA-free coating for healthy cooking.',
      price: 3499,
      discount: 30,
      stock: 40,
      brand: 'ChefPro',
      rating: 4.4,
      isFeatured: true,
      categoryId: categories[2].id,
    },
    {
      title: 'The Art of Programming',
      slug: 'the-art-of-programming',
      description: 'A comprehensive guide to modern programming practices. Covers algorithms, data structures, and software design patterns.',
      price: 499,
      discount: 5,
      stock: 80,
      brand: 'TechBooks',
      rating: 4.8,
      isFeatured: false,
      categoryId: categories[3].id,
    },
    {
      title: 'Organic Face Serum',
      slug: 'organic-face-serum',
      description: 'Premium organic face serum with Vitamin C and Hyaluronic Acid. Brightens skin and reduces fine lines.',
      price: 899,
      discount: 15,
      stock: 100,
      brand: 'GlowNaturals',
      rating: 4.5,
      isFeatured: true,
      categoryId: categories[4].id,
    },
    {
      title: 'Yoga Mat Premium',
      slug: 'yoga-mat-premium',
      description: 'Extra thick 6mm yoga mat with non-slip surface. Eco-friendly TPE material. Includes carrying strap.',
      price: 1299,
      discount: 10,
      stock: 60,
      brand: 'FitZone',
      rating: 4.3,
      isFeatured: false,
      categoryId: categories[5].id,
    },
    {
      title: 'Wireless Charging Pad',
      slug: 'wireless-charging-pad',
      description: 'Fast wireless charging pad compatible with all Qi-enabled devices. Sleek design with LED indicator.',
      price: 999,
      discount: 20,
      stock: 150,
      brand: 'ChargeTech',
      rating: 4.1,
      isFeatured: true,
      categoryId: categories[0].id,
    },
    {
      title: 'Running Shoes AirMax',
      slug: 'running-shoes-airmax',
      description: 'Lightweight running shoes with cushioned sole and breathable mesh upper. Perfect for daily runs and gym workouts.',
      price: 3999,
      discount: 15,
      stock: 75,
      brand: 'SprintX',
      rating: 4.6,
      isFeatured: true,
      categoryId: categories[5].id,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }
  console.log('✅ Products created:', products.length);

  // Create banners
  const banners = [
    {
      title: 'Summer Sale - Up to 50% Off',
      imageUrl: '/uploads/banner-summer.jpg',
      linkUrl: '/shop?sort=discount',
      isActive: true,
    },
    {
      title: 'New Electronics Collection',
      imageUrl: '/uploads/banner-electronics.jpg',
      linkUrl: '/shop?category=electronics',
      isActive: true,
    },
    {
      title: 'Fashion Week Special',
      imageUrl: '/uploads/banner-fashion.jpg',
      linkUrl: '/shop?category=fashion',
      isActive: true,
    },
  ];

  for (const banner of banners) {
    const existing = await prisma.banner.findFirst({ where: { title: banner.title } });
    if (!existing) {
      await prisma.banner.create({ data: banner });
    }
  }
  console.log('✅ Banners created');

  console.log('\n🎉 Seed completed!');
  console.log('Admin login: admin@store.com / admin123');
  console.log('User login: user@store.com / user123');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
