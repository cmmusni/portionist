import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "API_BASE_URL_OVERRIDE";
let currentOverride: string | null = null;

export const loadOverride = async (): Promise<void> => {
  try {
    const v = await AsyncStorage.getItem(KEY);
    currentOverride = v;
  } catch (err) {
    console.error("Failed to load API_BASE_URL override", err);
  }
};

export const getOverride = (): string | null => currentOverride;

export const setOverride = async (url: string | null): Promise<void> => {
  try {
    if (!url) {
      await AsyncStorage.removeItem(KEY);
      currentOverride = null;
      return;
    }
    await AsyncStorage.setItem(KEY, url);
    currentOverride = url;
  } catch (err) {
    console.error("Failed to set API_BASE_URL override", err);
  }
};

export default { loadOverride, getOverride, setOverride };
