import { Slot } from "expo-router";
import { useColorScheme } from "react-native";
import { ThemeProvider } from "@react-navigation/native";
import "../global.css";
import { LightTheme } from "@/theme";
import { TailwindProvider } from "tailwindcss-react-native";
import { Alert, StyleSheet, View, AppState } from "react-native";
import { supabase } from "@/utils/supabase";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { router } from "expo-router";

import * as Notifications from "expo-notifications";
import { useEffect } from "react";

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

function useNotificationObserver() {
  useEffect(() => {
    let isMounted = true;

    requestPermissionsAsync();

    function redirect(notification: Notifications.Notification) {
      const url = notification.request.content.data?.url;
      if (url) {
        router.push(url);
      }
    }

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!isMounted || !response?.notification) {
        return;
      }
      redirect(response?.notification);
    });

    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        redirect(response.notification);
      }
    );

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestPermissionsAsync() {
  return await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  useNotificationObserver();

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
