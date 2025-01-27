import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  StatusBar,
} from "react-native";
import { Link, Stack } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';
import SignInForm from "@/components/SignInForm";
import Logo from "@/assets/images/logo.svg";
import Google from "@/assets/images/google.svg";
import GoogleLoginButton from "@/components/googleLoginButton";

export default function Page() {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const { colors } = useTheme();

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
            className="p-10 pt-24"
        >
          <StatusBar barStyle="dark-content" />
          <Stack.Screen
              options={{
                title: "Connexion",
                headerShown: false,
              }}
          />
          <Animated.ScrollView
              contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-start" }}
              style={{ opacity: fadeAnim }}
              showsVerticalScrollIndicator={false}
          >
            <View style={{ marginHorizontal: "auto" }}>
              <Logo width={250} height={250} />
            </View>

            <View className="flex-row items-end justify-between mb-4 mt-10">
              <Text
                  className="font-extrabold text-3xl"
                  style={{ color: colors.text }}
              >
                Connexion
              </Text>
            </View>

            <SignInForm />

            <View className="flex-row justify-between mt-8 mb-4">
              <TouchableOpacity>
                <Text className="text-sm" style={{ color: colors.text }}>
                  Besoin d'aide
                </Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Link href="/sign-up-onboarding" asChild>
                  <TouchableOpacity>
                    <Text className="text-base" style={{ color: colors.primary }}>
                      S'inscrire
                    </Text>
                  </TouchableOpacity>
                </Link>
              </TouchableOpacity>
            </View>
            <View className="space-y-4">
              <View className="bg-gray-400 h-[1px] w-full mb-4" />
              <Text className="text-center text-gray-500 mb-4">Ou</Text>

              <GoogleLoginButton title=" Connexion avec google" />
            </View>
          </Animated.ScrollView>
        </KeyboardAvoidingView>
  );
}

