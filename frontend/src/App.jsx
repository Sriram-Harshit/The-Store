import { HashRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";

import Header from "./Components/Header/header.jsx";
import Home from "./Components/Home/home.jsx";

import AuthRoute from "./routes/AuthRoute.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";

import Register from "./Components/Register/register.jsx";
import Login from "./Components/Login/login.jsx";

import UserProfile from "./Components/UserProfile/userprofile.jsx";

import Cart from "./Components/Cart/cart.jsx";
import OrderManagement from "./Components/OrderManagement/orders.jsx";
import NotFound from "./Components/NotFound/notfound.jsx";
import "./App.css";

const App = () => {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />

          <Route element={<AuthRoute />}>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/orders" element={<OrderManagement />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
