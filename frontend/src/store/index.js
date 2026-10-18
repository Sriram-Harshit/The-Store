import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import profileReducer from "./slices/profileSlice";
import addressReducer from "./slices/addressSlice";
import wishlistReducer from "./slices/wishlistSlice";
import searchReducer from "./slices/searchSlice";
import productsReducer from "./slices/productsSlice";
import cartReducer from "./slices/cartSlice";
import ordersReducer from "./slices/ordersSlice";
import axios from "axios";
import { logout } from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    address: addressReducer,
    wishlist: wishlistReducer,
    search: searchReducer,
    products: productsReducer,
    cart: cartReducer,
    orders: ordersReducer,
  },
});

// Auto logout on 401/403 invalid or expired token
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      if (store.getState().auth.isLoggedIn) {
        store.dispatch(logout());
      }
    }
    return Promise.reject(error);
  }
);
