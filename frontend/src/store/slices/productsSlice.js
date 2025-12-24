import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import config from "../../config/config";

/* ================= FETCH PRODUCTS ================= */
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${config.apiUrl}/product/products`);
      return res.data;
    } catch {
      return rejectWithValue("Failed to fetch products");
    }
  }
);

/* ================= SEARCH PRODUCTS ================= */
export const searchProducts = createAsyncThunk(
  "products/searchProducts",
  async (query, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${config.apiUrl}/product/search`, {
        params: { query },
      });
      return res.data.results;
    } catch {
      return rejectWithValue("Search failed");
    }
  }
);

const productsSlice = createSlice({
  name: "products",
  initialState: {
    items: [],
    searchResults: [],
    wishlist: [],
    loading: false,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      /* ===== PRODUCTS ===== */
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===== SEARCH ===== */
      .addCase(searchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default productsSlice.reducer;
