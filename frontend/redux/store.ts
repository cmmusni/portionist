import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import pantryReducer from "./pantrySlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    pantry: pantryReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
