import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import config from "../../config/config";
import { logout } from "../slices/authSlice";

/* ================= FETCH WISHLIST ================= */
export const fetchWishlist = createAsyncThunk(
  "wishlist/fetch",
  async (_, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    if (!token) return rejectWithValue("Not authenticated");

    try {
      const res = await axios.get(`${config.apiUrl}/wishlist/getuserwishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Normalize to product IDs ONLY
      return res.data.items.map((item) => item._id || item);
    } catch {
      return rejectWithValue("Failed to load wishlist");
    }
  }
);

/* ================= TOGGLE WISHLIST ================= */
export const toggleWishlist = createAsyncThunk(
  "wishlist/toggle",
  async (productId, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    if (!token) return rejectWithValue("Please login first");

    try {
      const res = await axios.post(
        `${config.apiUrl}/wishlist/wishlistUpdate`,
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Explicit action (NO string guessing later)
      const action = res.data.message.includes("added") ? "added" : "removed";

      return { productId, action };
    } catch {
      return rejectWithValue("Wishlist update failed");
    }
  }
);

/* ================= SLICE ================= */
const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: [], // ONLY product IDs
    loading: false,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      /* ===== FETCH ===== */
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===== TOGGLE (OPTIMISTIC UPDATE) ===== */
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        const { productId, action: toggleAction } = action.payload;

        if (toggleAction === "added") {
          if (!state.items.includes(productId)) {
            state.items.push(productId);
          }
        } else if (toggleAction === "removed") {
          state.items = state.items.filter((id) => id !== productId);
        }
      })

      /* ===== LOGOUT CLEANUP ===== */
      .addCase(logout, (state) => {
        state.items = [];
        state.loading = false;
        state.error = null;
      });
  },
});

export default wishlistSlice.reducer;
