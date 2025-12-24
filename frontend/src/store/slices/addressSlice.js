import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import config from "../../config/config";

/* ================= ADD ADDRESS ================= */
export const addAddress = createAsyncThunk(
  "address/add",
  async (address, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    if (!token) return rejectWithValue("Please login again");

    try {
      await axios.post(
        `${config.apiUrl}/users/profile/addresses`,
        { address },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return "Address added successfully";
    } catch {
      return rejectWithValue("Failed to add address");
    }
  }
);

/* ================= UPDATE ADDRESS ================= */
export const updateAddress = createAsyncThunk(
  "address/update",
  async ({ id, address }, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    if (!token) return rejectWithValue("Please login again");

    try {
      await axios.put(
        `${config.apiUrl}/users/profile/address/${id}`,
        { address },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return "Address updated successfully";
    } catch {
      return rejectWithValue("Failed to update address");
    }
  }
);

const addressSlice = createSlice({
  name: "address",
  initialState: {
    loading: false,
    message: "",
    messageType: "",
  },

  reducers: {
    clearAddressMessage: (state) => {
      state.message = "";
      state.messageType = "";
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(addAddress.pending, (s) => {
        s.loading = true;
      })
      .addCase(addAddress.fulfilled, (s, a) => {
        s.loading = false;
        s.message = a.payload;
        s.messageType = "success";
      })
      .addCase(addAddress.rejected, (s, a) => {
        s.loading = false;
        s.message = a.payload;
        s.messageType = "error";
      })

      .addCase(updateAddress.pending, (s) => {
        s.loading = true;
      })
      .addCase(updateAddress.fulfilled, (s, a) => {
        s.loading = false;
        s.message = a.payload;
        s.messageType = "success";
      })
      .addCase(updateAddress.rejected, (s, a) => {
        s.loading = false;
        s.message = a.payload;
        s.messageType = "error";
      });
  },
});

export const { clearAddressMessage } = addressSlice.actions;
export default addressSlice.reducer;
