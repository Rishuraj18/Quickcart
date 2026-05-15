# E-Commerce API Reference

> **Base URL:** `http://localhost:5000/api`  
> **Auth:** Bearer Token in `Authorization` header  
> **Images:** Served from `http://localhost:5000/uploads/filename.jpg`

---

## 🔐 Authentication

### POST `/auth/signup`
Register a new user.
```json
// Request
{ "name": "John Doe", "email": "john@example.com", "password": "password123" }

// Response 201
{ "user": { "id": 1, "name": "John Doe", "email": "john@example.com", "role": "USER" }, "token": "eyJhb..." }
```

### POST `/auth/login`
Login with credentials.
```json
// Request
{ "email": "john@example.com", "password": "password123" }

// Response 200
{ "user": { "id": 1, "name": "John Doe", "email": "john@example.com", "role": "USER" }, "token": "eyJhb..." }
```

### GET `/auth/profile` 🔒
Get current user profile.
```json
// Response 200
{ "id": 1, "name": "John Doe", "email": "john@example.com", "role": "USER", "createdAt": "2026-05-14T..." }
```

### PUT `/auth/profile` 🔒
Update profile name.
```json
// Request
{ "name": "John Updated" }

// Response 200
{ "id": 1, "name": "John Updated", "email": "john@example.com", "role": "USER" }
```

---

## 📦 Products

### GET `/products`
List products with filters, sorting, pagination.
```
Query Params:
  page=1          (default: 1)
  limit=12        (default: 12)
  category=electronics  (category slug)
  sort=price_asc | price_desc | newest | rating
  search=headphones
  featured=true
  minPrice=100
  maxPrice=5000
```
```json
// Response 200
{
  "products": [
    {
      "id": 1, "title": "Wireless Headphones", "slug": "wireless-headphones",
      "description": "...", "price": 2999, "discount": 15, "stock": 50,
      "brand": "SoundMax", "rating": 4.5, "isFeatured": true,
      "categoryId": 1,
      "category": { "id": 1, "name": "Electronics", "slug": "electronics" },
      "images": [{ "id": 1, "url": "/uploads/1716000000-123.jpg" }],
      "createdAt": "...", "updatedAt": "..."
    }
  ],
  "pagination": { "page": 1, "limit": 12, "total": 50, "pages": 5 }
}
```

### GET `/products/:slug`
Get single product by slug with reviews + related products.
```json
// Response 200
{
  "product": {
    "id": 1, "title": "...", "slug": "...", "description": "...",
    "price": 2999, "discount": 15, "stock": 50, "brand": "SoundMax",
    "rating": 4.5, "isFeatured": true,
    "category": { "id": 1, "name": "Electronics", "slug": "electronics" },
    "images": [{ "id": 1, "url": "/uploads/..." }],
    "reviews": [
      { "id": 1, "rating": 5, "comment": "Great!", "user": { "id": 2, "name": "Jane" }, "createdAt": "..." }
    ]
  },
  "related": [ /* same structure as product list */ ]
}
```

### POST `/products` 🔒👑
Create product (Admin). **multipart/form-data**
```
Fields: title, slug, description, price, discount, stock, brand, rating, categoryId, isFeatured
Files:  images (up to 5 files)
```
```json
// Response 201
{ "id": 1, "title": "...", "category": {...}, "images": [...] }
```

### PUT `/products/:id` 🔒👑
Update product (Admin). **multipart/form-data** — same fields as create, all optional.

### DELETE `/products/:id` 🔒👑
Delete product.
```json
// Response 200
{ "message": "Product deleted successfully." }
```

### DELETE `/products/image/:imageId` 🔒👑
Delete a single product image.

---

## 📂 Categories

### GET `/categories`
List all categories with product counts.
```json
// Response 200
[
  { "id": 1, "name": "Electronics", "slug": "electronics", "image": "/uploads/...", "_count": { "products": 12 } }
]
```

### GET `/categories/:slug`
Get single category by slug.

### POST `/categories` 🔒👑
Create category. **multipart/form-data**
```
Fields: name, slug
Files:  image (single file)
```

### PUT `/categories/:id` 🔒👑
Update category. **multipart/form-data** — same fields, all optional.

### DELETE `/categories/:id` 🔒👑
Delete category. Fails if products exist under it.

---

## 🖼️ Banners

### GET `/banners`
Get active banners (public, for homepage).
```json
// Response 200
[
  { "id": 1, "title": "Summer Sale", "imageUrl": "/uploads/...", "linkUrl": "/shop?sort=discount", "isActive": true }
]
```

### GET `/banners/all` 🔒👑
Get ALL banners including inactive (Admin).

### POST `/banners` 🔒👑
Create banner. **multipart/form-data**
```
Fields: title, linkUrl, isActive
Files:  image (single file, required)
```

### PUT `/banners/:id` 🔒👑
Update banner. **multipart/form-data** — same fields, all optional.

### DELETE `/banners/:id` 🔒👑
Delete banner.

---

## 🛒 Cart (All routes 🔒)

### GET `/cart`
Get current user's cart with product details.
```json
// Response 200
{
  "id": 1, "userId": 2,
  "items": [
    {
      "id": 1, "cartId": 1, "productId": 3, "quantity": 2,
      "product": { "id": 3, "title": "...", "price": 2999, "discount": 15, "images": [{ "url": "..." }] }
    }
  ]
}
```

### POST `/cart/items`
Add item to cart.
```json
// Request
{ "productId": 3, "quantity": 1 }

// Response 200 — full cart object
```

### PUT `/cart/items/:itemId`
Update item quantity. Set quantity to 0 to remove.
```json
// Request
{ "quantity": 3 }
```

### DELETE `/cart/items/:itemId`
Remove item from cart.

### DELETE `/cart`
Clear entire cart.
```json
// Response 200
{ "message": "Cart cleared." }
```

---

## 📋 Orders (All routes 🔒)

### POST `/orders`
Create order after payment.
```json
// Request
{
  "items": [
    { "productId": 3, "quantity": 2, "price": 2549.15 }
  ],
  "totalAmount": 5098.30,
  "paymentId": "pay_abc123",
  "addressId": 1
}

// Response 201 — full order object with items
```

### GET `/orders/my`
Get current user's orders.
```json
// Response 200
[
  {
    "id": 1, "userId": 2, "totalAmount": 5098.30,
    "status": "PENDING", "paymentStatus": "COMPLETED",
    "paymentId": "pay_abc123", "createdAt": "...",
    "items": [
      { "id": 1, "quantity": 2, "price": 2549.15, "product": { "title": "...", "images": [...] } }
    ]
  }
]
```

### GET `/orders/:id`
Get single order (user sees own, admin sees all).

### GET `/orders/all` 🔒👑
Get all orders with pagination (Admin).
```
Query Params: page=1, limit=20, status=PENDING|CONFIRMED|SHIPPED|DELIVERED|CANCELLED
```

### PUT `/orders/:id/status` 🔒👑
Update order status (Admin).
```json
// Request
{ "status": "SHIPPED" }

// Allowed values: PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
```

---

## ⭐ Reviews

### GET `/reviews/product/:productId`
Get all reviews for a product (public).

### POST `/reviews` 🔒
Create a review (one per product per user).
```json
// Request
{ "productId": 3, "rating": 5, "comment": "Amazing product!" }

// Response 201
{ "id": 1, "rating": 5, "comment": "...", "user": { "id": 2, "name": "Jane" }, "createdAt": "..." }
```

### GET `/reviews/all` 🔒👑
Get all reviews (Admin moderation).

### DELETE `/reviews/:id` 🔒👑
Delete review (Admin). Auto-updates product average rating.

---

## 👤 Users & Addresses

### GET `/users/addresses` 🔒
Get current user's addresses.
```json
// Response 200
[
  { "id": 1, "street": "123 Main St", "city": "Mumbai", "state": "MH", "zipCode": "400001", "country": "India", "isDefault": true }
]
```

### POST `/users/addresses` 🔒
Add new address.
```json
// Request
{ "street": "123 Main St", "city": "Mumbai", "state": "MH", "zipCode": "400001", "country": "India", "isDefault": true }
```

### DELETE `/users/addresses/:id` 🔒
Delete address.

### GET `/users` 🔒👑
Get all users with order counts (Admin).

### PUT `/users/:id/role` 🔒👑
Change user role (Admin).
```json
{ "role": "ADMIN" }   // or "USER"
```

### PUT `/users/:id/status` 🔒👑
Block/unblock user (Admin).
```json
{ "status": "BLOCKED" }   // or "ACTIVE"
```

### DELETE `/users/:id` 🔒👑
Delete user (Admin).

---

## 📊 Dashboard & Payments

### GET `/dashboard/stats` 🔒👑
Get admin dashboard statistics.
```json
// Response 200
{
  "totalUsers": 150,
  "totalProducts": 45,
  "totalOrders": 320,
  "totalSales": 458000,
  "recentOrders": [ /* last 10 orders with user info */ ]
}
```

### POST `/dashboard/payment/create-order` 🔒
Create Razorpay payment order.
```json
// Request
{ "amount": 5098.30 }

// Response 200 (Razorpay configured)
{ "id": "order_abc123", "amount": 509830, "currency": "INR", "status": "created" }

// Response 200 (Mock mode - Razorpay not configured)
{ "id": "mock_order_1716000000", "amount": 509830, "currency": "INR", "status": "created", "mock": true }
```

### POST `/dashboard/payment/verify` 🔒
Verify Razorpay payment signature.
```json
// Request
{ "razorpay_order_id": "order_abc", "razorpay_payment_id": "pay_abc", "razorpay_signature": "sig_abc" }

// Response 200
{ "success": true, "paymentId": "pay_abc" }
```

---

## 🔑 Legend

| Symbol | Meaning |
|--------|---------|
| 🔒 | Requires `Authorization: Bearer <token>` header |
| 👑 | Admin only (role = ADMIN) |
| **multipart/form-data** | Use FormData for file uploads |

---

## 📁 Control Flow

```
Client Request
    │
    ▼
Express Router (routes/*.js)
    │ ── Matches URL pattern
    ▼
Middleware Chain
    │ ── authenticate() → verifies JWT, attaches req.user
    │ ── isAdmin()      → checks req.user.role === 'ADMIN'
    │ ── multer upload  → handles file uploads to /public/uploads/
    ▼
Controller (controllers/*.js)
    │ ── Validates input
    │ ── Calls Prisma ORM
    ▼
Prisma Client → MySQL Database
    │
    ▼
Response → JSON to Client
    │
    ▼
Error? → errorHandler middleware → formatted error response
```

## 📁 File Structure

```
backend/
├── public/uploads/           ← Uploaded images stored here
├── prisma/schema.prisma      ← Database schema
├── src/
│   ├── server.js             ← Express app entry point
│   ├── config/
│   │   ├── db.js             ← Prisma client singleton
│   │   └── multer.js         ← File upload config
│   ├── middleware/
│   │   ├── auth.js           ← JWT auth + admin check
│   │   └── errorHandler.js   ← Centralized error handling
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── categoryController.js
│   │   ├── bannerController.js
│   │   ├── cartController.js
│   │   ├── orderController.js
│   │   ├── reviewController.js
│   │   ├── userController.js
│   │   ├── dashboardController.js
│   │   └── paymentController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── bannerRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── userRoutes.js
│   │   └── dashboardRoutes.js
│   └── prisma/
│       └── seed.js           ← Demo data seeder
├── database_schema.sql       ← Raw SQL for MySQL Workbench
├── .env                      ← Environment variables
└── package.json
```
