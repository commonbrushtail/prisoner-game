import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
const initialState = {
  user: null,
  isHosting: false,
  hostingRoomID: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateUser: (state, action) => {
      state.user = action.payload;
    },
    removeUser: (state) => {
      state.user = null;
    },
    updateIsHosting: (state, action) => {
      state.isHosting = action.payload;
    },
    updateHostingRoomId: (state, action) => {
      state.hostingRoomID = action.payload;
    },
  },
});

export const { updateUser, removeUser, updateIsHosting, updateHostingRoomId } = userSlice.actions;

export const updateIsHostingThunk = createAsyncThunk("user/updateIsHosting", async () => {});

export default userSlice.reducer;
