import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  setOnboardingCompleted,
  setOnboardingData,
} from "../redux/pantrySlice";
import { loadOnboardingFromStorage } from "./useOnboardingStorage";

export const useOnboardingRestore = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    restoreOnboardingFromStorage();
  }, []);

  const restoreOnboardingFromStorage = async () => {
    try {
      const storedData = await loadOnboardingFromStorage();
      if (storedData) {
        dispatch(
          setOnboardingData({
            userAge: storedData.userAge,
            currentWeight: storedData.currentWeight,
            targetWeight: storedData.targetWeight,
            cuisine: storedData.cuisine,
          }),
        );
        // Restore onboarding completed flag
        if (storedData.onboardingCompleted) {
          dispatch(setOnboardingCompleted(true));
        }
      }
    } catch (error) {
      console.error("Failed to restore onboarding data:", error);
    }
  };
};
