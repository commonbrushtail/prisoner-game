import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
const initialState = {
  user: null,
  isHosting: false,
  userRoomId: null,
  isInRoom: false,
  userIsLeavingRoom: false,
  isClosingRoom: false,
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
    updateUserIsLeavingRoom: (state, action) => {
      state.userIsLeavingRoom = action.payload;
    },
    updateIsHosting: (state, action) => {
      state.isHosting = action.payload;
    },
    updateIsInRoom: (state, action) => {
      state.isInRoom = action.payload;
    },
    updateUserRoomId: (state, action) => {
      state.userRoomId = action.payload;
    },
    updateIsClosingRoom: (state, action) => {
      state.isClosingRoom = action.payload;
    },
  },
});

export const { updateUser, removeUser, updateIsHosting, updateUserRoomId, updateIsInRoom, updateIsClosingRoom, updateUserIsLeavingRoom } = userSlice.actions;

export const userStateKey = (state) => (state.user.isHosting ? "hostState" : "guestState");
export const userCountdownStateKey = (state) => (state.user.isHosting ? "hostCountdown" : "guestCountdown");
export const updateIsHostingThunk = createAsyncThunk("user/updateIsHosting", async () => {});

export default userSlice.reducer;
