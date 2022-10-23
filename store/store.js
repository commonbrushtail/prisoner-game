import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../store/user/user.slice";
import loadingReducer from "../store/loading/loading.slice";
import logger from "redux-logger";
import onlineReducer from "../store/online/online.slice";
import roomListReducer from "../store/roomList/roomList.slice";
export const store = configureStore({
  reducer: {
    user: userReducer,
    loading: loadingReducer,
    online: onlineReducer,
    roomList: roomListReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});
