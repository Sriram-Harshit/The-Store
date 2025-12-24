import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import config from "../../config/config";

/* ================= FETCH CART ================= */
export const fetchCart = createAsyncThunk(
  "cart/fetch",
  async (_, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    if (!token) return rejectWithValue("Please login");

    try {
      const res = await axios.get(`${config.apiUrl}/cart/getcart/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.items;
    } catch {
      return rejectWithValue("Failed to load cart");
    }
  }
);

/* ================= ADD TO CART ================= */
export const addToCart = createAsyncThunk(
  "cart/add",
  async ({ productId, quantity }, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    if (!token) return rejectWithValue("Please login");

    try {
      const res = await axios.post(
        `${config.apiUrl}/cart/cartUpdate`,
        { productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data.items; // ✅ updated cart
    } catch {
      return rejectWithValue("Failed to add to cart");
    }
  }
);

/* ================= UPDATE QUANTITY ================= */
export const updateCartItem = createAsyncThunk(
  "cart/update",
  async ({ productId, quantity }, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    if (!token) return rejectWithValue("Please login");

    try {
      const res = await axios.post(
        `${config.apiUrl}/cart/cartUpdate`,
        { productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data.items; // ✅ updated cart
    } catch {
      return rejectWithValue("Failed to update quantity");
    }
  }
);

/* ================= REMOVE ITEM ================= */
export const removeFromCart = createAsyncThunk(
  "cart/remove",
  async (productId, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    if (!token) return rejectWithValue("Please login");

    try {
      const res = await axios.delete(`${config.apiUrl}/cart/removeItem`, {
        data: { productId },
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.items; // ✅ updated cart
    } catch {
      return rejectWithValue("Failed to remove item");
    }
  }
);

/* ================= PLACE ORDER ================= */
export const placeOrder = createAsyncThunk(
  "cart/placeOrder",
  async (_, { getState, rejectWithValue }) => {
    const { cart, auth } = getState();
    if (!auth.token) return rejectWithValue("Please login");

    const totalPrice = cart.items.reduce(
      (sum, i) => sum + i.productId.price * i.quantity,
      0
    );

    try {
      await axios.post(
        `${config.apiUrl}/orders/placeOrder`,
        { cartItems: cart.items, totalPrice },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );

      await axios.post(
        `${config.apiUrl}/cart/clearCart`,
        {},
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );

      return true;
    } catch {
      return rejectWithValue("Order failed");
    }
  }
);

/* ================= SLICE ================= */
const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    loading: false,
    error: null,
    message: "",
    messageType: "",
  },

  reducers: {
    clearCartMessage: (state) => {
      state.message = "";
      state.messageType = "";
    },
  },

  extraReducers: (builder) => {
    builder
      /* FETCH CART */
      .addCase(fetchCart.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchCart.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload;
      })
      .addCase(fetchCart.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      /* ADD TO CART */
      .addCase(addToCart.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(addToCart.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload;
        s.message = "Added to cart";
        s.messageType = "success";
      })
      .addCase(addToCart.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      /* UPDATE QUANTITY */
      .addCase(updateCartItem.pending, (s) => {
        s.loading = true;
      })
      .addCase(updateCartItem.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload;
      })
      .addCase(updateCartItem.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      /* REMOVE ITEM */
      .addCase(removeFromCart.pending, (s) => {
        s.loading = true;
      })
      .addCase(removeFromCart.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload;
        s.message = "Item removed from cart";
        s.messageType = "success";
      })
      .addCase(removeFromCart.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      /* PLACE ORDER */
      .addCase(placeOrder.fulfilled, (s) => {
        s.items = [];
        s.message = "Order placed successfully";
        s.messageType = "success";
      });
  },
});

export const { clearCartMessage } = cartSlice.actions;
export default cartSlice.reducer;
