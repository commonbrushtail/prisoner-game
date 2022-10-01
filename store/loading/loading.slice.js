import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  isloading: false,
};

export const userSlice = createSlice({
  name: "loading",
  initialState,
  reducers: {
    updateIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const { updateIsLoading, isLoading } = userSlice.actions;
export default userSlice.reducer;
