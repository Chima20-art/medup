import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { useTheme } from "@react-navigation/native";
import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";

export default function SignInForm() {
  const { colors } = useTheme();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSignInPress = async () => {
    console.log("emailAddress", emailAddress);
    console.log("password", password);
    setIsSigningIn(true);
    const { error, data } = await supabase.auth.signInWithPassword({
      email: emailAddress,
      password: password,
    });

    console.log("error", error);
    console.log("data", data);
    setIsSigningIn(false);
    if (error) {
      setError(error.message);
    } else {
      router.replace("/dashboard");
    }
  };

  return (
    <View className="space-y-4">
      <View>
        <Text className="font-sans mb-2" style={{ color: colors.text }}>
          E-mail
        </Text>
        <TextInput
          className="bg-gray-100 p-5 rounded-xl mb-4"
          style={{ color: colors.text }}
          value={emailAddress}
          onChangeText={setEmailAddress}
          placeholder="johndoe@gmail.com"
          placeholderTextColor={colors.border}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
        />
      </View>

      <View>
        <Text className="font-sans mb-2" style={{ color: colors.text }}>
          Password
        </Text>
        <View className="flex-row items-center bg-gray-100 rounded-xl">
          <TextInput
            className="flex-1 p-5"
            style={{ color: colors.text }}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••••••"
            placeholderTextColor={colors.border}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            className="pr-4"
          >
            {showPassword ? (
              <EyeOff color={colors.text} size={24} />
            ) : (
              <Eye color={colors.text} size={24} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {error && <Text className="text-red-500 text-center pt-4">{error}</Text>}
      <TouchableOpacity
        className="bg-primary-500 py-4 rounded-lg mt-8 w-full mx-auto"
        onPress={onSignInPress}
        disabled={isSigningIn}
      >
        <Text className="text-white text-center font-semibold ">
          {isSigningIn ? "Connexion..." : "Entrer"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
