import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import config from "../../config/config";

/* ================= REGISTER ================= */
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${config.apiUrl}/users/register`,
        data
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);

/* ================= LOGIN ================= */
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${config.apiUrl}/users/login`,
        credentials
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: localStorage.getItem("token"),
    isLoggedIn: !!localStorage.getItem("token"),
    user: (() => {
      try {
        return JSON.parse(localStorage.getItem("user") || "null");
      } catch {
        return null;
      }
    })(),
    loading: false,
    error: null,
  },

  reducers: {
    logout: (state) => {
      state.token = null;
      state.isLoggedIn = false;
      state.user = null;
      state.error = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    updateAuthUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      try {
        localStorage.setItem("user", JSON.stringify(state.user));
      } catch {
        // ignore storage errors
      }
    },
  },

  extraReducers: (builder) => {
    builder

      /* ===== REGISTER ===== */
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        // ❗ No auto-login on register (correct UX)
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===== LOGIN ===== */
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.isLoggedIn = true;
        state.user = action.payload.user || null;
        state.error = null;
        localStorage.setItem("token", action.payload.token);
        if (action.payload.user) {
          try {
            localStorage.setItem("user", JSON.stringify(action.payload.user));
          } catch {
            // ignore
          }
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, updateAuthUser } = authSlice.actions;
export default authSlice.reducer;
