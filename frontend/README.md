# 🎨 TheStore — Frontend Client

The client for **TheStore** is a high-performance single-page web application engineered with **React 18**, **Vite 7**, and **Redux Toolkit**, featuring strict Role-Based Access Control (RBAC), an interactive AI Shopping Concierge, and an isolated Welcome Showcase Portal (`/welcome`).

---

## 🚀 Key Features

1. **Role-Based Portals & Route Isolation:**
   - 🛍️ **Customer Storefront (`/user`):** Full retail e-commerce shopping experience with instant search, category filtering, persistent cart, customer reviews, order tracking receipts, and customer profile.
   - 🏪 **Verified Merchant Hub (`/seller`):** SKU inventory management, new product creation with deep technical specifications, sales telemetry, order fulfillment status dispatch, and KYC compliance dossier.
   - 🛡️ **Platform Administrator (`/admin`):** Platform-wide metrics, merchant vetting and approval queue, catalog product moderation, and user role governance.
   - 🌟 **Welcome Portal Showcase (`/welcome`):** Clean, minimal 3-portal gateway with test credentials and direct navigation to `/user`, `/seller`, and `/admin`. Header, Footer, and AI Chatbot are automatically hidden to present an uncluttered interface.

2. **Session Interception & Account Switcher:**
   - Powered by `ProtectedRoute.jsx`. When an authenticated user of one role attempts to access another role's portal (e.g., a customer navigating to `/seller`), the request is intercepted with a restriction card and one-click session reset buttons.

3. **In-Depth Technical Specifications Modal:**
   - Tabbed specifications grid (Display, Audio, Hardware, Connectivity, In The Box, Reviews).
   - Flipkart/Amazon-style 4-point bullet feature highlights.
   - Interactive Customer Review submission with live star selector.
   - Delivery & trust guarantees (Free 2-day delivery, 7-day replacement, brand warranty).

4. **AI Shopping Assistant (3-Step Discovery Wizard):**
   - **Step 1 (Requirement):** Captures what product the shopper needs (Laptops, Smart TVs, Audio, Clothing, Books).
   - **Step 2 (Price):** Captures budget range or custom price ceiling.
   - **Step 3 (Primary Use):** Gathers exact use case (e.g. 120Hz Gaming, 4K Cinema Streaming, Coding, Activewear).
   - **Fulfill Needs:** Evaluates specifications, computes match scores, and provides direct "Specs" and "Add to Cart" action cards. Automatically hidden on `/welcome`, `/admin`, and `/seller`.

---

## 🛠️ Tech Stack & Dependencies

- **Framework:** React 18 (Functional components, hooks)
- **Build Tool:** Vite 7 (Lightning-fast HMR and optimized production bundling)
- **State Management:** Redux Toolkit (`authSlice`, `productsSlice`, `cartSlice`, `ordersSlice`, `searchSlice`)
- **Routing:** React Router DOM v6 with role-guarded routes (`ProtectedRoute`, `AuthRoute`)
- **HTTP Client:** Axios with centralized base URL and Bearer token handling
- **Styling:** Vanilla CSS with custom design system tokens, responsive glassmorphism, Bootstrap Icons
- **Deployment:** Vercel SPA rewrite ready (`vercel.json`)

---

## 📁 Directory Structure

```text
frontend/
├── public/                       # Static public assets (SVG icons, favicons)
├── src/
│   ├── Components/
│   │   ├── admin/                # Admin Console & supervisor portal
│   │   │   ├── AdminPortal.jsx   # Tabbed control room (Metrics, Sellers, Products, Users)
│   │   │   ├── AdminLogin.jsx    # Dedicated Administrator login
│   │   │   ├── AdminNavbar.jsx   # Dedicated Administrator navbar
│   │   │   └── AdminDesktopOnlyGuard.jsx # Guard for desktop viewports
│   │   ├── seller/               # Merchant Workstation
│   │   │   ├── SellerPortal.jsx  # Inventory, Orders, KYC Documents, Analytics
│   │   │   └── SellerLogin.jsx   # Dedicated Merchant login
│   │   ├── customer/             # Consumer Storefront & Workflows
│   │   │   ├── Home/             # Product catalog grid, category bar, deals
│   │   │   ├── Cart/             # Stock-aware cart calculation & checkout
│   │   │   ├── OrderManagement/  # Order history receipts & status timeline
│   │   │   ├── UserProfile/      # Account settings & address management
│   │   │   ├── Login/            # Customer authentication
│   │   │   └── Register/         # Customer registration
│   │   └── common/               # Shared Application Components
│   │       ├── Welcome/          # Standalone 3-portal showcase (/welcome)
│   │       ├── Header/           # Adaptive role navbar
│   │       ├── Footer/           # Enterprise marketplace footer
│   │       ├── Chatbot/          # 3-Step AI Discovery Concierge
│   │       ├── ProductDetails/   # Deep technical specs modal & reviews
│   │       └── NotFound/         # 404 handler
│   ├── config/                   # Centralized API URL resolver (config.jsx)
│   ├── routes/
│   │   ├── ProtectedRoute.jsx    # RBAC route interceptor & restriction modal
│   │   └── AuthRoute.jsx         # Guest-only route guard
│   ├── store/                    # Redux store configuration & domain slices
│   ├── utils/                    # Product images, API logger, notification toasts
│   ├── App.jsx                   # Master route configuration
│   ├── index.css                 # Global CSS design tokens
│   └── main.jsx                  # React DOM entry point
├── vercel.json                   # Vercel SPA client rewrite configuration
├── package.json
└── vite.config.js
```

---

## ⚙️ Environment Configuration

Frontend environment variables can be set in `frontend/.env` or inside your Vercel Project Settings:

```env
# Point to your running backend API server
# Local development:
VITE_API_URL=http://localhost:5000/api

# Production:
# VITE_API_URL=https://your-backend-api.vercel.app/api
VITE_ENV=development
```

*(Refer to [`env-template.txt`](file:///c:/Users/srira/Downloads/The-Store/env-template.txt) in the project root for full options)*

---

## 🚀 Vercel Deployment

The `frontend/vercel.json` file handles Single Page Application (SPA) routing:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This prevents `404 Not Found` errors when users directly load or reload routes like `/welcome`, `/user`, `/seller`, or `/admin`.

---

## 💻 Available Scripts

In the `frontend/` directory, you can run:

```bash
# Start local development server on http://localhost:3000
npm run dev

# Compile optimized production bundle to /dist
npm run build

# Preview production build locally
npm run preview
```
