import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_STORAGE_KEY = "portionist_onboarding";

export interface OnboardingStorageData {
  userAge: number;
  currentWeight?: number;
  targetWeight?: number;
  cuisine: string;
  savedAt: string;
  onboardingCompleted?: boolean;
}

export const saveOnboardingToStorage = async (data: OnboardingStorageData) => {
  try {
    await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save onboarding data to storage:", error);
  }
};

export const loadOnboardingFromStorage =
  async (): Promise<OnboardingStorageData | null> => {
    try {
      const data = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error("Failed to load onboarding data from storage:", error);
      return null;
    }
  };

export const clearOnboardingFromStorage = async () => {
  try {
    await AsyncStorage.removeItem(ONBOARDING_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear onboarding data from storage:", error);
  }
};
