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
      <LinearGradient
          colors={['#ddb6f1', '#90CAF933']}
          style={{ flex: 1 }}
      >
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
                  className="font-bold text-3xl font-semibold"
                  style={{ color: colors.text }}
              >
                Connexion
              </Text>
              <Link href="/sign-up-onboarding" asChild>
                <TouchableOpacity>
                  <Text className="text-base" style={{ color: colors.primary }}>
                    S'inscrire
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>

            <SignInForm />

            <View className="flex-row justify-between mt-8 mb-4">
              <TouchableOpacity>
                <Text className="text-sm" style={{ color: colors.text }}>
                  Besoin d'aide
                </Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text className="text-sm" style={{ color: colors.text }}>
                  Changer le mot de passe
                </Text>
              </TouchableOpacity>
            </View>
            <View className="space-y-4">
              <View className="bg-gray-400 h-[1px] w-full mb-4" />
              <Text className="text-center text-gray-500 mb-4">Ou</Text>

              <TouchableOpacity className="flex-row justify-center items-center  space-x-8">
                <View
                    className="w-10 h-10 rounded-full shadow-sm items-center justify-center border border-gray-200"
                >
                  <Google width={20} height={20} color="#DB4437" />

                </View>
                <Text> Connexion avec google</Text>
              </TouchableOpacity>
            </View>
          </Animated.ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
  );
}

