const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean the database first
  console.log('🗑️ Cleaning old data...');
  await prisma.orderItem.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.banner.deleteMany({});
  
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
  const categoriesData = [
    { name: 'Electronics', slug: 'electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661' },
    { name: 'Fashion', slug: 'fashion', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8' },
    { name: 'Shoes', slug: 'shoes', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff' },
    { name: 'Smartphone', slug: 'smartphone', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9' },
    { name: 'Accessories', slug: 'accessories', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30' },
  ];

  const categories = [];
  for (const c of categoriesData) {
    const cat = await prisma.category.create({ data: c });
    categories.push(cat);
  }
  console.log('✅ Categories created:', categories.length);

  // Create products
  const products = [
    { title: 'IPhone 15 Pro', slug: 'iphone-15-pro', description: 'Apple iPhone 15 Pro with 256GB storage.', price: 99999, discount: 5, stock: 50, brand: 'Apple', rating: 4.8, isFeatured: true, categoryId: categories[3].id, imageUrl: '/uploads/products/iphone15pro.jpg' },
    { title: 'Samsung Galaxy S24', slug: 'samsung-galaxy-s24', description: 'Samsung Galaxy S24 Ultra', price: 74999, discount: 10, stock: 40, brand: 'Samsung', rating: 4.7, isFeatured: true, categoryId: categories[3].id, imageUrl: '/uploads/products/samsuns24.jpg' },
    { title: 'Nike Air Max', slug: 'nike-air-max', description: 'Nike Air Max Running Shoes', price: 10999, discount: 15, stock: 100, brand: 'Nike', rating: 4.6, isFeatured: true, categoryId: categories[2].id, imageUrl: '/uploads/products/nikeairmax.jpg' },
    { title: 'Adidas Ultraboost', slug: 'adidas-ultraboost', description: 'Adidas Ultraboost Running Shoes', price: 12999, discount: 10, stock: 80, brand: 'Adidas', rating: 4.5, isFeatured: false, categoryId: categories[2].id, imageUrl: '/uploads/products/adidasultraboost.jpg' },
    { title: 'Puma Sneakers', slug: 'puma-sneakers', description: 'Puma Casual Sneakers', price: 4999, discount: 20, stock: 150, brand: 'Puma', rating: 4.2, isFeatured: false, categoryId: categories[2].id, imageUrl: '/uploads/products/puma sneakers.jpg' },
    { title: 'MacBook Air M3', slug: 'macbook-air-m3', description: 'Apple MacBook Air M3 Chip', price: 114999, discount: 5, stock: 30, brand: 'Apple', rating: 4.9, isFeatured: true, categoryId: categories[0].id, imageUrl: '/uploads/products/macbookairm3.jpg' },
    { title: 'Dell XPS 15', slug: 'dell-xps-15', description: 'Dell XPS 15 Premium Laptop', price: 144999, discount: 10, stock: 20, brand: 'Dell', rating: 4.7, isFeatured: true, categoryId: categories[0].id, imageUrl: '/uploads/products/dellxps15.jpg' },
    { title: 'HP Pavilion Gaming', slug: 'hp-pavilion-gaming', description: 'HP Pavilion Gaming Laptop', price: 65999, discount: 15, stock: 60, brand: 'HP', rating: 4.4, isFeatured: false, categoryId: categories[0].id, imageUrl: '/uploads/products/hp pavaliiongaming.jpg' },
    { title: 'Sony WH-1000XM5', slug: 'sony-wh-1000xm5', description: 'Sony WH-1000XM5 Wireless Headphones', price: 29999, discount: 10, stock: 45, brand: 'Sony', rating: 4.8, isFeatured: true, categoryId: categories[4].id, imageUrl: '/uploads/products/sonyxm5.jpg' },
    { title: 'boAt Rockerz 450', slug: 'boat-rockerz-450', description: 'boAt Rockerz 450 Wireless Headphone', price: 1499, discount: 40, stock: 200, brand: 'boAt', rating: 4.1, isFeatured: false, categoryId: categories[4].id, imageUrl: '/uploads/products/boatrockerz450.jpg' },
    { title: 'Apple Watch Series 9', slug: 'apple-watch-series-9', description: 'Apple Watch Series 9 Smartwatch', price: 41999, discount: 5, stock: 75, brand: 'Apple', rating: 4.7, isFeatured: true, categoryId: categories[4].id, imageUrl: '/uploads/products/applewatchseries9.jpg' },
    { title: 'Blue Jacket', slug: 'blue-jacket', description: 'Stylish Blue Winter Jacket', price: 2499, discount: 20, stock: 120, brand: 'FashionCo', rating: 4.3, isFeatured: true, categoryId: categories[1].id, imageUrl: '/uploads/products/bluejacket.jpg' },
    { title: 'Pink Hoodie', slug: 'pink-hoodie', description: 'Comfortable Pink Cotton Hoodie', price: 1499, discount: 15, stock: 150, brand: 'FashionCo', rating: 4.4, isFeatured: false, categoryId: categories[1].id, imageUrl: '/uploads/products/pinkhoodie.jpg' },
    { title: 'Blue Jeans', slug: 'blue-jeans', description: 'Classic Blue Denim Jeans', price: 1999, discount: 10, stock: 180, brand: 'DenimBrand', rating: 4.2, isFeatured: true, categoryId: categories[1].id, imageUrl: '/uploads/products/bluejeans.jpg' },
    { title: 'Samsung 55 inch TV', slug: 'samsung-55-inch-tv', description: 'Samsung 55 inch 4K Smart TV', price: 54999, discount: 25, stock: 35, brand: 'Samsung', rating: 4.6, isFeatured: true, categoryId: categories[0].id, imageUrl: '/uploads/products/samsung55inch tv.jpg' },
    { title: 'Canon 1500D', slug: 'canon-1500d', description: 'Canon EOS 1500D DSLR Camera', price: 34999, discount: 10, stock: 25, brand: 'Canon', rating: 4.5, isFeatured: true, categoryId: categories[0].id, imageUrl: '/uploads/products/cannon1500d.jpg' },
    { title: 'Logitech Gaming Mouse', slug: 'logitech-gaming-mouse', description: 'Logitech G502 Hero Gaming Mouse', price: 3999, discount: 30, stock: 90, brand: 'Logitech', rating: 4.7, isFeatured: true, categoryId: categories[4].id, imageUrl: '/uploads/products/logitech gaming mouse.jpg' },
    { title: 'Mechanical Keyboard', slug: 'mechanical-keyboard', description: 'RGB Mechanical Gaming Keyboard', price: 5499, discount: 15, stock: 65, brand: 'Keychron', rating: 4.8, isFeatured: true, categoryId: categories[4].id, imageUrl: '/uploads/products/mechanical keyboard.jpg' },
    { title: 'Realme Buds Air 5', slug: 'realme-buds-air-5', description: 'Realme Buds Air 5 Pro TWS', price: 4999, discount: 20, stock: 110, brand: 'Realme', rating: 4.3, isFeatured: false, categoryId: categories[4].id, imageUrl: '/uploads/products/realmebudsair5.jpg' }
  ];

  products.reverse();

  for (const p of products) {
    const { imageUrl, ...productData } = p;
    await prisma.product.create({
      data: {
        ...productData,
        images: {
          create: [{ url: imageUrl }]
        }
      }
    });
  }
  console.log('✅ Products created:', products.length);

  // Create banners
  const banners = [
    {
      title: 'Mega Electronics Sale',
      imageUrl: 'https://picsum.photos/seed/banner_5/1200/400',
      linkUrl: '/products',
      isActive: false,
    },
    {
      title: 'Latest Fashion Collection',
      imageUrl: 'https://picsum.photos/seed/banner_2/1200/400',
      linkUrl: '/fashion',
      isActive: true,
    },
    {
      title: 'Top Mobile Deals',
      imageUrl: 'https://picsum.photos/seed/banner_3/1200/400',
      linkUrl: '/smartphone',
      isActive: true,
    },
    {
      title: 'Gaming Accessories',
      imageUrl: 'https://picsum.photos/seed/banner_4/1200/400',
      linkUrl: '/accessories',
      isActive: true,
    },
  ];

  for (const banner of banners) {
    await prisma.banner.create({ data: banner });
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
