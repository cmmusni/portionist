import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { Provider } from "react-redux";

import RootLayoutContent from "@/frontend/navigation/RootLayoutContent";
import { store } from "@/frontend/redux/store";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <RootLayoutContent />
      <StatusBar style="auto" />
    </Provider>
  );
}
