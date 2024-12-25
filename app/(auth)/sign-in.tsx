import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Image,
  StatusBar,
} from "react-native";
import { Link, Stack } from "expo-router";
import { useTheme } from "@react-navigation/native";
import SignInForm from "@/components/SignInForm";
import WelcomeIllustration from "@/assets/images/welcome-illustration.svg";

// remove this to add google sign in button
// import {
//   GoogleSignin,
//   GoogleSigninButton,
//   statusCodes,
// } from "@react-native-google-signin/google-signin";

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

  //  this is for google sign in button
  //   GoogleSignin.configure({
  //     scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  //     webClientId:
  //       "192222339018-pocaaq250a8pr6bq67sc1idnubd4u4c8.apps.googleusercontent.com",
  //   });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }} // Ensure it takes the full screen height
      className="bg-white p-10 pt-24"
    >
      <StatusBar barStyle="dark-content" />
      <Stack.Screen
        options={{
          title: "Connexion",
          headerShown: false,
        }}
      />
      <Animated.ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-start" }} // Use flexGrow to push content to the bottom
        style={{ opacity: fadeAnim }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginHorizontal: "auto" }}>
          {" "}
          {/* Adjust spacing here */}
          <WelcomeIllustration width={250} height={250} />
        </View>

        <View className="flex-row items-end justify-between mb-4 mt-14">
          <Text
            className="font-bold text-3xl font-semibold"
            style={{ color: colors.text }}
          >
            Connexion
          </Text>
          <Link href="/sign-up" asChild>
            <TouchableOpacity>
              <Text className="text-base" style={{ color: colors.primary }}>
                S'inscrire
              </Text>
            </TouchableOpacity>
          </Link>
        </View>

        <SignInForm />

        {/* remove this to add google sign in button
         <GoogleSigninButton
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={async () => {
            try {
              await GoogleSignin.hasPlayServices();
              const userInfo = await GoogleSignin.signIn();
              if (userInfo.data.idToken) {
                const { data, error } = await supabase.auth.signInWithIdToken({
                  provider: "google",
                  token: userInfo.data.idToken,
                });
                console.log(error, data);
              } else {
                throw new Error("no ID token present!");
              }
            } catch (error: any) {
              if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                // user cancelled the login flow
              } else if (error.code === statusCodes.IN_PROGRESS) {
                // operation (e.g. sign in) is in progress already
              } else if (
                error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE
              ) {
                // play services not available or outdated
              } else {
                // some other error happened
              }
            }
          }}
        /> */}

        <View className="flex-row justify-between mt-10 mb-8">
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
      </Animated.ScrollView>
    </KeyboardAvoidingView>
  );
}
