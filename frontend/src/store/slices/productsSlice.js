import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import config from "../../config/config";

const CACHE_KEY = "thestore_cached_products_v2";

const getCachedProducts = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed.data)) {
      return parsed.data;
    }
    return [];
  } catch {
    return [];
  }
};

const setCachedProducts = (data) => {
  try {
    if (Array.isArray(data) && data.length) {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ data, timestamp: Date.now() })
      );
    }
  } catch {
    // Gracefully handle storage quota limitations
  }
};

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

const initialCachedItems = getCachedProducts();

const productsSlice = createSlice({
  name: "products",
  initialState: {
    items: initialCachedItems,
    searchResults: [],
    wishlist: [],
    loading: initialCachedItems.length === 0, // Only show initial load if no cache
    isRevalidating: false,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      /* ===== PRODUCTS ===== */
      .addCase(fetchProducts.pending, (state) => {
        if (!state.items.length) {
          state.loading = true;
        } else {
          state.isRevalidating = true;
        }
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.isRevalidating = false;
        if (Array.isArray(action.payload)) {
          state.items = action.payload;
          setCachedProducts(action.payload);
        } else if (action.payload && Array.isArray(action.payload.products)) {
          state.items = action.payload.products;
          setCachedProducts(action.payload.products);
        } else {
          state.items = Array.isArray(state.items) ? state.items : [];
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.isRevalidating = false;
        // Don't error out the screen if we already have cached products displayed
        if (!state.items || !state.items.length) {
          state.error = action.payload;
        }
      })

      /* ===== SEARCH ===== */
      .addCase(searchProducts.pending, (state) => {
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.searchResults = action.payload;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default productsSlice.reducer;
