import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  user: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateUser: (state, action) => {
      state.user = action.payload;
      // state.user = action.payload;
    },
    removeUser: (state) => {
      state.user = null;
    },
  },
});

export const { updateUser, removeUser } = userSlice.actions;
export default userSlice.reducer;
