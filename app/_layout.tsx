import { Slot } from "expo-router";
import { useColorScheme } from "react-native";
import { ThemeProvider } from "@react-navigation/native";
import "../global.css";
import { LightTheme } from "@/theme";
import { TailwindProvider } from "tailwindcss-react-native";
import { Alert, StyleSheet, View, AppState } from "react-native";
import { supabase } from "@/utils/supabase";
import {GestureHandlerRootView} from "react-native-gesture-handler";

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? LightTheme : LightTheme}>
      <TailwindProvider>
        <GestureHandlerRootView>
          <Slot />
        </GestureHandlerRootView>
      </TailwindProvider>
    </ThemeProvider>
  );
}
