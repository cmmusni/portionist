import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  email: string | null;
  fullName: string | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  userId: null,
  email: null,
  fullName: null,
  token: null,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Sign up actions
    signUpStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    signUpSuccess: (
      state,
      action: PayloadAction<{
        userId: string;
        email: string;
        fullName: string;
        token: string;
      }>,
    ) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.userId = action.payload.userId;
      state.email = action.payload.email;
      state.fullName = action.payload.fullName;
      state.token = action.payload.token;
      state.error = null;
    },
    signUpFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.error = action.payload;
    },

    // Sign in actions
    signInStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    signInSuccess: (
      state,
      action: PayloadAction<{
        userId: string;
        email: string;
        fullName: string;
        token: string;
      }>,
    ) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.userId = action.payload.userId;
      state.email = action.payload.email;
      state.fullName = action.payload.fullName;
      state.token = action.payload.token;
      state.error = null;
    },
    signInFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.error = action.payload;
    },

    // Sign out
    signOut: (state) => {
      state.isAuthenticated = false;
      state.userId = null;
      state.email = null;
      state.fullName = null;
      state.token = null;
      state.error = null;
    },

    // Restore auth from storage
    restoreAuth: (
      state,
      action: PayloadAction<{
        userId: string;
        email: string;
        fullName: string;
        token: string;
      } | null>,
    ) => {
      if (action.payload) {
        state.isAuthenticated = true;
        state.userId = action.payload.userId;
        state.email = action.payload.email;
        state.fullName = action.payload.fullName;
        state.token = action.payload.token;
      } else {
        state.isAuthenticated = false;
        state.userId = null;
        state.email = null;
        state.fullName = null;
        state.token = null;
      }
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  signUpStart,
  signUpSuccess,
  signUpFailure,
  signInStart,
  signInSuccess,
  signInFailure,
  signOut,
  restoreAuth,
  clearError,
} = authSlice.actions;

// Selectors
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const selectUserId = (state: { auth: AuthState }) => state.auth.userId;
export const selectEmail = (state: { auth: AuthState }) => state.auth.email;
export const selectFullName = (state: { auth: AuthState }) =>
  state.auth.fullName;
export const selectToken = (state: { auth: AuthState }) => state.auth.token;
export const selectIsLoading = (state: { auth: AuthState }) =>
  state.auth.isLoading;
export const selectError = (state: { auth: AuthState }) => state.auth.error;

// Memoized selector to prevent unnecessary rerenders
export const selectAuthUser = createSelector(
  [selectUserId, selectEmail, selectFullName, selectToken],
  (userId, email, fullName, token) => ({
    userId,
    email,
    fullName,
    token,
  }),
);

export default authSlice.reducer;
