import * as React from "react";
import {
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { router, Link } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useTheme } from "@react-navigation/native";
import DateOfBirthStep from "@/components/age-step";
import NameStep from "@/components/name-step";
import EmailStep from "@/components/email-step";
import PhoneStep from "@/components/phone-step";
import PasswordStep from "@/components/pasword-step";
import VerificationStep from "@/components/verification-step";
import ConfirmationStep from "@/components/confirmation-step";
import { supabase } from "@/utils/supabase";

export default function SignUpScreen() {
  const { colors } = useTheme();
  const [step, setStep] = React.useState(1);

  // Form state
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [dateOfBirth, setDateOfBirth] = React.useState<Date | null>(null);
  const [emailAddress, setEmailAddress] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [verifingError, setVerifingError] = React.useState("");

  // Verification state
  const [code, setCode] = React.useState("");
  const [isVerifying, setIsVerifying] = React.useState(false);

  const onEmailSubmit = async () => {
    setStep(3);
  };

  const onPressVerify = async () => {
    console.log("onPressVerify");
    setIsVerifying(true);
    const { error, data } = await supabase.auth.signInWithPassword({
      email: emailAddress,
      password: password,
    });
    console.log("error", error);
    console.log("data", data);
    setIsVerifying(false);
    if (error) {
      setVerifingError(error.message);
    } else {
      setStep(7);
    }
  };

  const resendVerificationCode = async () => {
    console.log("resendVerificationCode");
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: emailAddress,
    });

    if (error) {
      console.error("Error resending verification email:", error);
      Alert.alert("Error", "Failed to resend verification email. Please try again.");
    } else {
      Alert.alert("Success", "Verification email has been resent. Please check your inbox.");
    }
  };


  const onSignUpPress = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    router.push('/dashboard')
    console.log("user", user);
    console.log("error", error);
  };

  const signUserUp = async () => {
    console.log("signUserUp");
    console.log(firstName, dateOfBirth, emailAddress, phoneNumber, password);
    const { data, error } = await supabase.auth.signUp({
      email: emailAddress,
      password: password,

      options: {
        data: {
          displayName: firstName,
          dateOfBirth: dateOfBirth,
          age: dateOfBirth
              ? Math.floor(
                  (new Date().getTime() - new Date(dateOfBirth).getTime()) /
                  (1000 * 60 * 60 * 24 * 365.25)
              )
              : null,
          phone: "+212" + phoneNumber,
        },
      },
    });
    console.log("data", data);
    console.log("error", error);
  };

  const renderStepContent = () => {
    const totalSteps = 7;
    switch (step) {
      case 1:
        return (
            <NameStep
                name={firstName}
                onNameChange={setFirstName}
                onContinue={() => setStep(2)}
                currentStep={step}
                totalSteps={totalSteps}
            />
        );
      case 2:
        return (
            <EmailStep
                emailAddress={emailAddress}
                onEmailChange={setEmailAddress}
                onContinue={onEmailSubmit}
                currentStep={step}
                totalSteps={totalSteps}
            />
        );
      case 3:
        return (
            <PasswordStep
                password={password}
                onPasswordChange={setPassword}
                onContinue={() => setStep(4)}
                currentStep={step}
                totalSteps={totalSteps}
            />
        );
      case 4:
        return (
            <PhoneStep
                phoneNumber={phoneNumber}
                onPhoneChange={setPhoneNumber}
                onContinue={() => setStep(5)}
                currentStep={step}
                totalSteps={totalSteps}
            />
        );
      case 5:
        return (
            <DateOfBirthStep
                onContinue={(date: Date) => {
                  setDateOfBirth(date);
                  console.log("onSignUpPress");
                  signUserUp();
                  setStep(6);
                }}
                currentStep={step}
                totalSteps={totalSteps}
            />
        );
      case 6:
        return (
            <VerificationStep
                code={"123456"}
                onCodeChange={setCode}
                onVerify={onPressVerify}
                isVerifying={isVerifying}
                resendCode={resendVerificationCode}
                verifingError={verifingError}
                currentStep={step}
                totalSteps={totalSteps}
            />
        );
      case 7:
        return <ConfirmationStep onContinue={onSignUpPress} />;
    }
  };

  return (
      <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
          style={{ backgroundColor: colors.background }}
      >
        <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              padding: 20,
            }}
        >
          {step > 1 && step < 7 && (
              <TouchableOpacity
                  className="absolute top-20 left-5 z-10"
                  onPress={() => setStep(step - 1)}
              >
                <ChevronLeft size={24} color={colors.text} />
              </TouchableOpacity>
          )}

          {renderStepContent()}

          {step !== 3 && step !== 7 && (
              <View className="flex-row justify-center mt-5 mb-10">
                <Text style={{ color: colors.text }}>Déjà un compte ?</Text>
                <Link href="/sign-in" asChild>
                  <TouchableOpacity>
                    <Text
                        className="ml-1 font-bold"
                        style={{ color: colors.primary }}
                    >
                      Se connecter
                    </Text>
                  </TouchableOpacity>
                </Link>
              </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
  );
}

