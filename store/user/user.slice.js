import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
const initialState = {
  user: null,
  isHosting: false,
  userRoomId: null,
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
    updateUserRoomId: (state, action) => {
      state.userRoomId = action.payload;
    },
  },
});

export const { updateUser, removeUser, updateIsHosting, updateUserRoomId } = userSlice.actions;

export const userStateKey = (state) => (state.user.isHosting ? "hostState" : "guestState");
export const userCountdownStateKey = (state) => (state.user.isHosting ? "hostCountdown" : "guestCountdown");
export const updateIsHostingThunk = createAsyncThunk("user/updateIsHosting", async () => {});

export default userSlice.reducer;
