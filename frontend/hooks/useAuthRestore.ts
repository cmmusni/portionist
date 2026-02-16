import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { restoreAuth } from "../redux/authSlice";

const AUTH_STORAGE_KEY = "portionist_auth";

export interface StoredAuthData {
  userId: string;
  email: string;
  fullName: string;
  token: string;
}

export const useAuthRestore = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    restoreAuthFromStorage();
  }, []);

  const restoreAuthFromStorage = async () => {
    try {
      const storedAuth = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuth) {
        const authData: StoredAuthData = JSON.parse(storedAuth);
        dispatch(restoreAuth(authData));
      } else {
        dispatch(restoreAuth(null));
      }
    } catch (error) {
      console.error("Failed to restore auth from storage:", error);
      dispatch(restoreAuth(null));
    }
  };
};

export const saveAuthToStorage = async (authData: StoredAuthData) => {
  try {
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
  } catch (error) {
    console.error("Failed to save auth to storage:", error);
  }
};

export const clearAuthFromStorage = async () => {
  try {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear auth from storage:", error);
  }
};
