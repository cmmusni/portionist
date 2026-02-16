import React from "react";
import { ActivityIndicator, View } from "react-native";
import { useSelector } from "react-redux";
import { useAuthRestore } from "../hooks/useAuthRestore";
import { useOnboardingRestore } from "../hooks/useOnboardingRestore";
import { selectIsAuthenticated } from "../redux/authSlice";
import AppNavigator from "./AppNavigator";

export default function RootLayoutContent() {
  // Restore auth from storage on app startup
  useAuthRestore();

  // Restore onboarding data from storage on app startup
  useOnboardingRestore();

  // Use a slightly delayed check to allow restoration
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [isRestoring, setIsRestoring] = React.useState(true);

  React.useEffect(() => {
    // Give a moment for auth restoration to complete
    const timer = setTimeout(() => setIsRestoring(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isRestoring) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return <AppNavigator />;
}
