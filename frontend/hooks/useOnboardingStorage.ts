import AsyncStorage from "@react-native-async-storage/async-storage";

const getOnboardingStorageKey = (userId: string) =>
  `portionist_onboarding_${userId}`;

export interface OnboardingStorageData {
  userAge: number;
  currentWeight?: number;
  targetWeight?: number;
  cuisine: string;
  savedAt: string;
  onboardingCompleted?: boolean;
}

export const saveOnboardingToStorage = async (
  userId: string,
  data: OnboardingStorageData,
) => {
  try {
    const key = getOnboardingStorageKey(userId);
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save onboarding data to storage:", error);
  }
};

export const loadOnboardingFromStorage = async (
  userId: string,
): Promise<OnboardingStorageData | null> => {
  try {
    const key = getOnboardingStorageKey(userId);
    const data = await AsyncStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error("Failed to load onboarding data from storage:", error);
    return null;
  }
};

export const clearOnboardingFromStorage = async (userId: string) => {
  try {
    const key = getOnboardingStorageKey(userId);
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error("Failed to clear onboarding data from storage:", error);
  }
};
