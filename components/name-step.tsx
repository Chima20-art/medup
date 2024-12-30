import React, { useState } from 'react';
import { View, Text, TextInput, Animated } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Logo from '@/assets/images/logo.svg';
import { CircularButton } from '@/components/Cicular-button';
import { UserIcon } from 'lucide-react-native';
import {Colors} from "@/constants/Colors";
import SignupUser from "@/assets/images/signupUser.svg"

interface NameStepProps {
    name: string;
    onNameChange: (value: string) => void;
    onContinue: () => void;
    currentStep: number;
    totalSteps: number;
}

export default function NameStep({
                                     name,
                                     onNameChange,
                                     onContinue,
                                     currentStep,
                                     totalSteps
                                 }: NameStepProps) {
    const [showError, setShowError] = useState(false);
    const [shakeAnimation] = useState(new Animated.Value(0));

    const handleContinue = () => {
        if (!name.trim()) {
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

    const { colors } = useTheme();

    const handleTextChange = (text: string) => {
        onNameChange(text);
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
                Écrivez votre nom d'utilisateur
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
                            value={name}
                            onChangeText={handleTextChange}
                            placeholder="Sofia"
                            placeholderTextColor={Colors.light.placeholder}
                        />
                        <View className="absolute right-3 top-5">
                            <SignupUser />
                        </View>
                    </View>
                    {showError && (
                        <Text className="text-red-500 text-sm mt-4">
                            Veuillez entrer votre nom d'utilisateur
                        </Text>
                    )}
                </Animated.View>
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

