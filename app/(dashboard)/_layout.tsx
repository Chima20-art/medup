import React, { useEffect } from "react";
import { View, TouchableOpacity } from "react-native";
import { Slot, useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { Home, Grid, Phone, MoreHorizontal } from "lucide-react-native";
import { supabase } from "@/utils/supabase";

export default function DashboardLayout() {
  const { colors } = useTheme();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      console.log("user", user);
      console.log("error", error);

      if (!error && user) {
        //router.replace("/dashboard");
      } else {
        router.replace("/sign-in");
      }
    };
    getUser();
  }, []);

  return (
    <View className="flex-1">
      <Slot />
      {/* Bottom Navigation */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          className="items-center"
          onPress={() => router.push("/dashboard")}
        >
          <Home size={24} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          className="items-center"
          onPress={() => router.push("/categories")}
        >
          <Grid size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          className="items-center"
          onPress={() => router.push("/contact")}
        >
          <Phone size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          className="items-center"
          onPress={() => router.push("/more")}
        >
          <MoreHorizontal size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
