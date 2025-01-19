import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import { Stack } from "expo-router/stack";
import { useEffect } from "react";

export default function Layout() {
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
        router.replace("/dashboard");
      }
    };
    getUser();
  });

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
