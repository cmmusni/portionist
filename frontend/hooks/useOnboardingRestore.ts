import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectUserId } from "../redux/authSlice";
import {
    setOnboardingCompleted,
    setOnboardingData,
} from "../redux/pantrySlice";
import { loadOnboardingFromStorage } from "./useOnboardingStorage";

export const useOnboardingRestore = () => {
  const dispatch = useDispatch();
  const userId = useSelector(selectUserId);

  useEffect(() => {
    if (userId) {
      restoreOnboardingFromStorage(userId);
    }
  }, [userId]);

  const restoreOnboardingFromStorage = async (userId: string) => {
    try {
      const storedData = await loadOnboardingFromStorage(userId);
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
