import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { supabase } from "@/utils/supabase";
import Google from "@/assets/images/google.svg";
import { router } from "expo-router"; // Assuming you have a Google icon

const GoogleLoginButton = ({ title }: { title: string }) => {
  const handleGoogleLogin = async () => {
    try {
      console.log("handleGoogleSignin");
      GoogleSignin.configure({
        webClientId:
          "200792291874-jhqs5qjs9q2thivc7s6msc7bguhtj79r.apps.googleusercontent.com",
        offlineAccess: true,
      });
      await GoogleSignin.hasPlayServices();
      console.log("hasPlayServices passed!");
      const userInfo = await GoogleSignin.signIn();
      console.log("userInfo", userInfo);
      if (userInfo.data?.idToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: userInfo.data?.idToken,
        });
        router.replace("/dashboard");
        console.log(error, data);
      } else {
        throw new Error("No ID token present!");
      }
    } catch (error: any) {
      console.log("error login", error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // User cancelled the login flow
        console.log("User cancelled the login flow");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // Operation (e.g., sign-in) is in progress already
        console.log("Operation (e.g., sign-in) is in progress already");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // Play services not available or outdated
        console.log("Play services not available or outdated");
      } else {
        // Some other error happened
        console.log("Some other error happened");
      }
    }
  };

  return (
    <TouchableOpacity
      className="w-full h-14 bg-white  rounded-xl flex-row items-center justify-center space-x-2"
      onPress={handleGoogleLogin}
    >
      <Google width={20} height={20} />
      <Text className="text-black text-base font-semibold ml-2">{title}</Text>
    </TouchableOpacity>
  );
};

export default GoogleLoginButton;
