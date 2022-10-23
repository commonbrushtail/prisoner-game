import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  online: {},
};

export const onlineSlice = createSlice({
  name: "online",
  initialState,
  reducers: {
    updateOnline: (state, action) => {
      state.online = action.payload;
    },
  },
});

export const userOnlineStateSelector = (state) => state.online.online[state.user.user.uid];
export const { updateOnline } = onlineSlice.actions;
export default onlineSlice.reducer;
