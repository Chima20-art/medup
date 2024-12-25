import React, { useEffect } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Slot, useRouter, usePathname } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { Home, Grid, Phone, MoreHorizontal, Plus } from "lucide-react-native";
import { supabase } from "@/utils/supabase";

export default function DashboardLayout() {
  const { colors } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  // Check if the current route is the add page
  const isAddPage = pathname === "/add-examin-radiologique";

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
      {!isAddPage && (
        <View className="flex-row items-center justify-between px-6 py-4 bg-white border-t border-gray-200">
          <TouchableOpacity
            className="items-center"
            onPress={() => router.push("/dashboard")}
          >
            <Home size={24} color={colors.primary} />
            <Text className="text-xs mt-1 text-gray-600">Accueil</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="items-center"
            onPress={() => router.push("/categories")}
          >
            <Grid size={24} color={colors.text} />
            <Text className="text-xs mt-1 text-gray-600">Catégories</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="items-center justify-center w-16 h-16 bg-indigo-600 rounded-full -mt-8 shadow-lg"
            onPress={() => router.push("/add")}
          >
            <Plus size={32} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity
            className="items-center"
            onPress={() => router.push("/contact")}
          >
            <Phone size={24} color={colors.text} />
            <Text className="text-xs mt-1 text-gray-600">Contact</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="items-center"
            onPress={() => router.push("/more")}
          >
            <MoreHorizontal size={24} color={colors.text} />
            <Text className="text-xs mt-1 text-gray-600">Plus</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
