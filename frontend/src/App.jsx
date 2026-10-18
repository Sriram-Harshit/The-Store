import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";

import Header from "./Components/common/Header/header.jsx";
import Footer from "./Components/common/Footer/Footer.jsx";
import Chatbot from "./Components/common/Chatbot/chatbot.jsx";
import NotFound from "./Components/common/NotFound/notfound.jsx";

import AuthRoute from "./routes/AuthRoute.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";

import Home from "./Components/customer/Home/home.jsx";
import Register from "./Components/customer/Register/register.jsx";
import Login from "./Components/customer/Login/login.jsx";
import UserProfile from "./Components/customer/UserProfile/userprofile.jsx";
import Cart from "./Components/customer/Cart/cart.jsx";
import OrderManagement from "./Components/customer/OrderManagement/orders.jsx";

import SellerPortal from "./Components/seller/SellerPortal.jsx";
import SellerLogin from "./Components/seller/SellerLogin.jsx";

import AdminPortal from "./Components/admin/AdminPortal.jsx";
import AdminLogin from "./Components/admin/AdminLogin.jsx";
import AdminDesktopOnlyGuard from "./Components/admin/AdminDesktopOnlyGuard.jsx";
import Welcome from "./Components/common/Welcome/Welcome.jsx";

import "./App.css";

const App = () => {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/welcome" element={<Welcome />} />

            {/* Dedicated Role Login Pages */}
            <Route
              path="/admin/login"
              element={
                <AdminDesktopOnlyGuard>
                  <AdminLogin />
                </AdminDesktopOnlyGuard>
              }
            />
            <Route path="/seller/login" element={<SellerLogin />} />
            <Route path="/user/login" element={<Login />} />

            <Route element={<AuthRoute />}>
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
            </Route>

            {/* Customer Only Protected Routes (Prefix: /user) */}
            <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
              <Route path="/user" element={<Home />} />
              <Route path="/user/store" element={<Home />} />
              <Route path="/user/cart" element={<Cart />} />
              <Route path="/user/orders" element={<OrderManagement />} />
              <Route path="/user/profile" element={<UserProfile />} />

              {/* Aliases for backwards compatibility */}
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/orders" element={<OrderManagement />} />
            </Route>

            {/* Seller Only Protected Portal */}
            <Route element={<ProtectedRoute allowedRoles={["seller"]} />}>
              <Route path="/seller" element={<SellerPortal />} />
              <Route path="/seller/*" element={<SellerPortal />} />
            </Route>

            {/* Admin Only Protected Portal */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route
                path="/admin"
                element={
                  <AdminDesktopOnlyGuard>
                    <AdminPortal />
                  </AdminDesktopOnlyGuard>
                }
              />
              <Route
                path="/admin/*"
                element={
                  <AdminDesktopOnlyGuard>
                    <AdminPortal />
                  </AdminDesktopOnlyGuard>
                }
              />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        {/* Global Enterprise Marketplace Footer */}
        <Footer />

        {/* Global Floating AI Shopping Assistant */}
        <Chatbot />
      </div>
    </Router>
  );
};

export default App;
