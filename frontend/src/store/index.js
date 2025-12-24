import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import profileReducer from "./slices/profileSlice";
import addressReducer from "./slices/addressSlice";
import wishlistReducer from "./slices/wishlistSlice";
import searchReducer from "./slices/searchSlice";
import productsReducer from "./slices/productsSlice";
import cartReducer from "./slices/cartSlice";
import ordersReducer from "./slices/ordersSlice";
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
