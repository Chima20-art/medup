import { supabase } from "@/utils/supabase";
import { Redirect, Stack, useRouter } from "expo-router";
import { useEffect } from "react";

export default function GuestLayout() {
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
