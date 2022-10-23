import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  roomList: {},
};

export const roomListSlice = createSlice({
  name: "roomList",
  initialState,
  reducers: {
    updateRoomList: (state, action) => {
      state.roomList = action.payload;
    },
  },
});

export const { updateRoomList } = roomListSlice.actions;
export default roomListSlice.reducer;
