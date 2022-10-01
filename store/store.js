import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../store/user/user.slice";
import loadingReducer from "../store/loading/loading.slice";
import logger from "redux-logger";

export const store = configureStore({
  reducer: {
    user: userReducer,
    loading: loadingReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});
