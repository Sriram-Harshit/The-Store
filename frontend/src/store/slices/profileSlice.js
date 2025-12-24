import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import config from "../../config/config";

/* ================= FETCH PROFILE ================= */
export const fetchProfile = createAsyncThunk(
  "profile/fetch",
  async (_, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    if (!token) return rejectWithValue("Not authenticated");

    try {
      const res = await axios.get(
        `${config.apiUrl}/users/profile/profileDetails`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data;
    } catch {
      return rejectWithValue("Failed to fetch profile");
    }
  }
);

/* ================= UPDATE PROFILE ================= */
export const updateProfile = createAsyncThunk(
  "profile/update",
  async (data, { getState, rejectWithValue }) => {
    const token = getState().auth.token;

    try {
      await axios.put(`${config.apiUrl}/users/profile`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    } catch {
      return rejectWithValue("Profile update failed");
    }
  }
);

const profileSlice = createSlice({
  name: "profile",
  initialState: {
    data: null,
    loading: false,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchProfile.fulfilled, (s, a) => {
        s.loading = false;
        s.data = a.payload;
      })
      .addCase(fetchProfile.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      .addCase(updateProfile.fulfilled, (s, a) => {
        s.data = { ...s.data, ...a.payload };
      });
  },
});

export default profileSlice.reducer;
