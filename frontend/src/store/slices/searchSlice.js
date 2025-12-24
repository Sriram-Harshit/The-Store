import { createSlice } from "@reduxjs/toolkit";

const searchSlice = createSlice({
  name: "search",
  initialState: {
    searchterm: "",
  },
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchterm = action.payload;
    },
    clearSearch: (state) => {
      state.searchterm = "";
    },
  },
});

export const { setSearchTerm, clearSearch } = searchSlice.actions;
export default searchSlice.reducer;
