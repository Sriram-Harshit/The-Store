import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import config from "../../config/config";

/* ================= FETCH ORDERS ================= */
export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;

      if (!token) {
        return rejectWithValue("Please login to view orders");
      }

      const res = await axios.get(`${config.apiUrl}/orders/getOrders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return res.data.orders || [];
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch orders"
      );
    }
  }
);

/* ================= CANCEL ORDER ================= */
export const cancelOrder = createAsyncThunk(
  "orders/cancelOrder",
  async (orderId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;

      if (!token) {
        return rejectWithValue("Please login");
      }

      await axios.post(
        `${config.apiUrl}/orders/cancelOrder`,
        { orderId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return orderId;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to cancel order"
      );
    }
  }
);

/* ================= SLICE ================= */
const ordersSlice = createSlice({
  name: "orders",
  initialState: {
    items: [],
    loading: false,
    error: null,
    message: "",
    messageType: "",
  },

  reducers: {
    clearOrderMessage: (state) => {
      state.message = "";
      state.messageType = "";
    },
  },

  extraReducers: (builder) => {
    builder
      /* ===== FETCH ORDERS ===== */
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.message = action.payload;
        state.messageType = "error";
      })

      /* ===== CANCEL ORDER ===== */
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(
          (order) => order._id !== action.payload
        );
        state.message = "Order canceled successfully";
        state.messageType = "success";
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.message = action.payload;
        state.messageType = "error";
      });
  },
});

export const { clearOrderMessage } = ordersSlice.actions;
export default ordersSlice.reducer;
