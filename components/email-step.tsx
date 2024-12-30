import React, { useState } from 'react';
import { View, Text, TextInput, Animated } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Logo from '@/assets/images/logo.svg';
import { CircularButton } from '@/components/Cicular-button';
import { MailIcon } from 'lucide-react-native';
import { Colors } from "@/constants/Colors";
import SignupEmail from "@/assets/images/signupEmail.svg"

interface EmailStepProps {
    emailAddress: string;
    onEmailChange: (value: string) => void;
    onContinue: () => void;
    currentStep: number;
    totalSteps: number;
}

export default function EmailStep({
                                      emailAddress,
                                      onEmailChange,
                                      onContinue,
                                      currentStep,
                                      totalSteps
                                  }: EmailStepProps) {
    const { colors } = useTheme();
    const [showError, setShowError] = useState(false);
    const [shakeAnimation] = useState(new Animated.Value(0));

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleContinue = () => {
        if (!validateEmail(emailAddress)) {
            setShowError(true);
            // Shake animation
            Animated.sequence([
                Animated.timing(shakeAnimation, {
                    toValue: 10,
                    duration: 100,
                    useNativeDriver: true
                }),
                Animated.timing(shakeAnimation, {
                    toValue: -10,
                    duration: 100,
                    useNativeDriver: true
                }),
                Animated.timing(shakeAnimation, {
                    toValue: 0,
                    duration: 100,
                    useNativeDriver: true
                })
            ]).start();
        } else {
            setShowError(false);
            onContinue();
        }
    };

    const handleTextChange = (text: string) => {
        onEmailChange(text);
        if (showError) {
            setShowError(false);
        }
    };

    return (
        <View className="flex-1 pt-16">
            <View className="mx-auto">
                <Logo />
            </View>

            <View className="h-16 flex-row items-center justify-center px-5">
                <View className="flex flex-row gap-x-0.5">
                    {Array.from({ length: totalSteps }).map((_, index) => (
                        <View
                            key={index}
                            className={`h-1 w-10 rounded-full`}
                            style={{
                                backgroundColor: index < currentStep ? colors.primary : colors.border
                            }}
                        />
                    ))}
                </View>
            </View>

            <Text className="text-[22px] font-bold text-start mt-8 mb-4 px-2" style={{ color: colors.text }}>
                Écrivez votre adresse e-mail:
            </Text>

            <View className="flex-1 px-2 mb-6">
                <Animated.View
                    style={{
                        transform: [{ translateX: shakeAnimation }]
                    }}
                >
                    <View className="relative">
                        <TextInput
                            className={`w-full flex-row justify-center px-4 h-16 text-xl font-sans rounded-lg bg-gray-50 ${
                                showError ? 'border border-red-500' : ''
                            }`}
                            style={{
                                color: Colors.light.text,
                                backgroundColor: '#F9FAFB'
                            }}
                            value={emailAddress}
                            onChangeText={handleTextChange}
                            placeholder="exemple@email.com"
                            placeholderTextColor={Colors.light.placeholder}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <View className="absolute right-3 top-5">
                            <SignupEmail  />
                        </View>
                    </View>
                    {showError && (
                        <Text className="text-red-500 text-sm mt-4">
                            Veuillez entrer une adresse email valide
                        </Text>
                    )}
                </Animated.View>
                <Text className="text-md mt-2 text-center" style={{ color: colors.text }}>
                    Nous vons enverrons un lien de vérification
                </Text>
            </View>

            <View className="items-center mb-4">
                <CircularButton
                    onPress={handleContinue}
                    currentStep={currentStep}
                    totalSteps={totalSteps}
                />
            </View>
        </View>
    );
}

