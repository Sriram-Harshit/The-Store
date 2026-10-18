# ⚙️ TheStore — Backend REST API

The backend for **TheStore** is a robust, modular REST API built with **Node.js**, **Express.js**, and **MongoDB Atlas** using **Mongoose ODM**. It enforces strict Role-Based Access Control (RBAC), structured request logging, and comprehensive route protection.

---

## 🚀 Key Features

1. **Role-Based Access Control (RBAC) Architecture:**
   - Dedicated middlewares for role enforcement: `requireCustomer`, `requireSeller`, and `requireAdmin`.
   - Complete domain separation: `src/customer/`, `src/seller/`, `src/admin/`, and `src/common/`.
   - Secure password hashing with Bcrypt and stateless JWT token authentication.

2. **Rich Product Catalog with Categorized Specifications:**
   - Extended specification subdocuments (`screenSize`, `display`, `resolution`, `refreshRate`, `soundOutput`, `processor`, `ram`, `storage`, `material`, `author`, etc.).
   - 4-point bullet highlights, package box contents, and verified customer reviews.
   - Verified buyer review submission API (`POST /api/product/:id/review`).
   - High-performance caching headers (`Cache-Control: public, max-age=300`) with `.lean()` queries.

3. **Cart, Order & Inventory Management:**
   - Real-time stock validation upon adding to cart and checkout.
   - Order status lifecycle tracking (`Placed`, `Processing`, `Shipped`, `Delivered`, `Cancelled`).
   - Customer-scoped cart and order isolation.

4. **Merchant & Governance Workflows:**
   - Merchant SKU inventory control, stock adjustments, and business KYC document submission.
   - Platform administrator oversight: Merchant approval/rejection queue, product moderation, and user role controls.

5. **Cloud Database Connectivity & Reliability:**
   - Windows Atlas SRV resolution fallback using Google & Cloudflare DNS servers (`dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1'])`).

---

## 🛠️ Tech Stack & Dependencies

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js 4
- **Database:** MongoDB Atlas (Cloud)
- **ODM:** Mongoose 8
- **Authentication:** `jsonwebtoken` (JWT), `bcrypt`
- **Security & Utilities:** `cors`, `dotenv`
- **Deployment:** Vercel Serverless Function ready (`@vercel/node`)

---

## 📁 Directory Structure

```text
backend/
├── src/
│   ├── admin/                    # Platform administration domain
│   │   ├── adminControllers.js   # Analytics, seller approval, product moderation
│   │   └── adminRoutes.js        # Protected /api/admin routes
│   ├── seller/                   # Merchant domain
│   │   ├── sellerControllers.js  # Inventory stock, order dispatch, KYC documents
│   │   └── sellerRoutes.js       # Protected /api/seller routes
│   ├── customer/                 # Consumer shopping domain
│   │   ├── controllers/          # User, cart, orders, wishlist, products
│   │   └── routes/               # Customer endpoints
│   ├── common/                   # Shared infrastructure
│   │   ├── dbconfig/             # Database connection & catalog seeders
│   │   └── middleware/           # authMiddleware, rbacMiddleware, loggerMiddleware
│   ├── models/                   # Mongoose schemas (User, Product, Order, Cart, Wishlist)
│   └── testRoutes.js             # Comprehensive 36-route automated audit suite
├── server.js                     # Express server & CORS configuration
├── vercel.json                   # Vercel Serverless Function deployment config
├── package.json
└── .env                          # Local secrets (never committed to Git)
```

---

## 📡 REST API Reference & Access Control Matrix

| Domain | Method | Endpoint | Access Level | Description |
|:---|:---|:---|:---|:---|
| **Health** | `GET` | `/` | Public | Server health status check |
| **Catalog** | `GET` | `/api/product/products` | Public | Retrieve all approved products (cached) |
| **Catalog** | `GET` | `/api/product/search` | Public | Query catalog by keyword, brand, category, price |
| **Catalog** | `GET` | `/api/product/:id` | Public | Fetch single product with fresh specs & reviews |
| **Review** | `POST` | `/api/product/:id/review` | Authenticated | Submit star rating and verified review comment |
| **Auth** | `POST` | `/api/users/register` | Public | Register new consumer account |
| **Auth** | `POST` | `/api/users/login` | Public | Authenticate user & return JWT token |
| **Customer**| `GET` | `/api/users/profile/profileDetails`| Customer Only | Retrieve authenticated user profile |
| **Customer**| `GET` | `/api/cart/getcart/user` | Customer Only | Get active shopping cart |
| **Customer**| `POST`| `/api/cart/cartUpdate` | Customer Only | Update product quantity or add item |
| **Customer**| `GET` | `/api/orders/getOrders` | Customer Only | Retrieve customer order history |
| **Customer**| `GET` | `/api/wishlist/getuserwishlist` | Customer Only | Retrieve wishlist items |
| **Customer**| `POST`| `/api/wishlist/wishlistUpdate` | Customer Only | Toggle wishlist item |
| **Seller** | `GET` | `/api/seller/dashboard` | Seller / Admin | Real-time merchant telemetry & sales |
| **Seller** | `GET` | `/api/seller/products` | Seller Only | Retrieve merchant SKU inventory |
| **Seller** | `GET` | `/api/seller/orders` | Seller Only | Retrieve seller order fulfillment queue |
| **Seller** | `GET` | `/api/seller/documents` | Seller Only | Retrieve uploaded merchant KYC documents |
| **Seller** | `POST`| `/api/seller/documents` | Seller Only | Submit merchant KYC & tax dossier |
| **Admin** | `GET` | `/api/admin/overview` | Admin Only | Platform-wide analytics & gross revenue |
| **Admin** | `GET` | `/api/admin/sellers` | Admin Only | List all registered seller applications |
| **Admin** | `PATCH`| `/api/admin/sellers/:id/status`| Admin Only | Approve or reject seller application |
| **Admin** | `GET` | `/api/admin/products` | Admin Only | Moderate catalog products |
| **Admin** | `PATCH`| `/api/admin/products/:id/status`| Admin Only | Approve or flag catalog product |
| **Admin** | `GET` | `/api/admin/users` | Admin Only | Platform user accounts & role management |

---

## ⚙️ Environment Configuration

Create a `.env` file in `backend/` (or configure in Vercel Project Settings):

```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/TheStore?retryWrites=true&w=majority
SESSION_SECRET=your_jwt_strong_secret_key
JWT_EXPIRES_IN=30d
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

*(See [`env-template.txt`](file:///c:/Users/srira/Downloads/The-Store/env-template.txt) in the project root for detailed instructions)*

---

## 🚀 Vercel Deployment

The `backend/vercel.json` configures the Express API as a Vercel Serverless Function:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

When deploying to Vercel:
1. Set the **Root Directory** to `backend`.
2. Add your `MONGO_URI` and `SESSION_SECRET` in **Environment Variables**.
3. Deploy!

---

## 💻 Available Scripts & Testing

In the `backend/` directory, you can run:

```bash
# Start backend server with nodemon auto-reload
npm run dev

# Start backend server in production mode
npm start

# Run comprehensive 36-route audit across all 4 user roles
node src/testRoutes.js

# Wipe and reseed clean database with catalog & test accounts
node src/dbconfig/seedData.js
```
