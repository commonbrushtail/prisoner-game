import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  isLoading: true,
};

export const userSlice = createSlice({
  name: "loading",
  initialState,
  reducers: {
    updateIsLoading: (state, action) => {
      console.log(state);
      state.isLoading = action.payload;
    },
  },
});

export const { updateIsLoading, isLoading } = userSlice.actions;
export default userSlice.reducer;
