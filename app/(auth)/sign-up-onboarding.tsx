import React from "react";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Google from "@/assets/images/google.svg";
import { Mail } from "lucide-react-native";
import Logo from "@/assets/images/logo.svg";
import { router } from "expo-router";
import GoogleLoginButton from "@/components/googleLoginButton";

export default function SignUpOnboarding() {
  return (
    <SafeAreaView className="flex-1 bg-primary-500 ">
      <ScrollView contentContainerClassName="flex-1">
        <View className="flex-1 px-6 pt-10">
          {/* Header */}
          <Text className="text-white text-[45px] font-bold mb-2">
            Bienvenue sur{"\n"}
            <Text className="text-[#A5B4FC]">Medup.</Text>
          </Text>

          {/* Main Image and Cards */}
          <View className="flex-1 justify-center items-center relative">
            <View className="w-fit h-fit p-4 pt-10 justify-center items-center aspect-square rounded-3xl overflow-hidden bg-white">
              <Image source={require("@/assets/images/categories.png")} />
            </View>
            <View className="absolute -top-2 right-0 bg-white rounded-2xl shadow-xl">
              <Logo width={200} height={100} />
            </View>
          </View>

          {/* Buttons */}
          <View className="flex flex-column gap-y-2 mb-6 w-full">
            {/*<TouchableOpacity className="w-full h-14 bg-black rounded-xl flex-row items-center justify-center space-x-2">*/}
            {/*  <Google width={20} height={20} />*/}
            {/*  <Text className="text-white text-base font-semibold ml-2">*/}
            {/*    S'inscrire avec google*/}
            {/*  </Text>*/}
            {/*</TouchableOpacity>*/}

            <GoogleLoginButton title="S'inscrire avec google"/>
            <TouchableOpacity
              className="w-full h-14 bg-black rounded-xl flex-row items-center justify-center"
              onPress={() => router.push("/sign-up")}
            >
              <Mail width={20} height={20} />
              <Text className="text-white text-base font-semibold ml-2">
                S'inscrire avec email
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <Text className="text-center text-white/70 text-sm mb-6">
            En vous inscrivant, vous acceptez nos{"\n"}
            <Text className="underline font-bold">
              Conditions d'utilisation
            </Text>{" "}
            et notre{" "}
            <Text className="underline font-bold">
              Politique de confidentialité
            </Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
