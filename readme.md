````md
# 🛒 E-Commerce Web Application (MERN Stack)

A full-stack **E-Commerce web application** built with the **MERN stack**, featuring secure authentication, cart & wishlist management, order handling, and user profile management — all wrapped in a clean, modern UI.

---

## 🚀 Features Overview

### 🔐 Authentication

- User registration & login
- JWT-based authentication
- Secure token handling using **Redux Toolkit**

### 👤 User Profile

- View and edit profile details
- Manage multiple addresses
- Wishlist management

### 🛍️ Products

- Browse available products
- Add / remove items from wishlist
- Add products to cart with quantity control

### 🛒 Cart

- Add, update, and remove cart items
- Stock-aware quantity validation
- Persistent cart state via backend

### 📦 Orders

- View complete order history
- Expand orders to view item details
- Cancel orders (if allowed)
- Order status tracking

### 🔔 Notifications

- Toast-style notifications
- Success, error, and info messages

---

## 🧰 Tech Stack

### 🎨 Frontend

- **React**
- **Redux Toolkit**
- **React Router**
- **Axios**
- **Custom CSS styling**

### ⚙️ Backend

- **Node.js**
- **Express.js**
- **MongoDB**
- **Mongoose**
- **JWT Authentication**

---

## 📁 Project Structure

```text
src/
├── components/
│   ├── Cart/
│   ├── Orders/
│   ├── Profile/
│   ├── Address/
│   ├── UI/
│   └── ProductDetails/
│
├── store/
│   ├── slices/
│   │   ├── authSlice.js
│   │   ├── cartSlice.js
│   │   ├── ordersSlice.js
│   │   ├── wishlistSlice.js
│   │   └── profileSlice.js
│   └── store.js
│
├── config/
│   └── config.js
│
└── utils/
```
````

---

## 🔄 State Management

- Global state managed using **Redux Toolkit**
- Async operations handled with `createAsyncThunk`
- Centralized handling of:

  - Loading states
  - Error states
  - Success messages

---

## 🔐 Authentication Flow

1. User logs in
2. JWT token is stored in **Redux** and `localStorage`
3. Protected API calls use the token from Redux state
4. Auto-logout supported via Redux action

---

## ⚙️ Setup & Installation

### 1️⃣ Clone the repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2️⃣ Install dependencies

**Frontend**

```bash
npm install
```

**Backend**

```bash
npm install
```

### 3️⃣ Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

### 4️⃣ Run the application

**Backend**

```bash
npm start
```

**Frontend**

```bash
npm start
```

---

## 🧪 Error Handling

- Graceful UI-level error handling
- Backend validation messages shown to users
- API failures handled through Redux rejected actions

---

## 🧠 Design Decisions

- Removed deprecated authentication utilities
- Fully migrated auth handling to Redux slice
- Eliminated unnecessary page reloads
- Ensured consistent backend response structures
- Guarded UI rendering against async race conditions

---

## 🎯 Future Improvements

- Payment gateway integration
- Order status timeline
- Product reviews & ratings
- Admin dashboard
- Skeleton loaders & animations

---

## 👨‍💻 Author

**Sri Ram Harshit**
Full Stack Developer (MERN)
Passionate about building scalable, user-friendly web applications.

---
