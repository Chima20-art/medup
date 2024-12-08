import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import React from "react";
import { View, Text, Button } from "react-native";

export default function More() {
  const router = useRouter();
  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/sign-in");
  };

  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-2xl font-bold">More Page</Text>
      <Button title="Sign Out" onPress={signOut} />
    </View>
  );
}
