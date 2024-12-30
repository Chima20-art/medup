import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Animated } from 'react-native';
import { Check, X, Phone } from 'lucide-react-native';
import { useTheme } from '@react-navigation/native';
import Logo from "@/assets/images/logo.svg";
import { CircularButton } from "@/components/Cicular-button";
import { Colors } from "@/constants/Colors";
import SignupPhone from "@/assets/images/signupPhone.svg"

interface PhoneStepProps {
    phoneNumber: string;
    onPhoneChange: (value: string) => void;
    onContinue: () => void;
    currentStep: number;
    totalSteps: number;
}

export default function PhoneStep({
                                      phoneNumber,
                                      onPhoneChange,
                                      onContinue,
                                      currentStep,
                                      totalSteps
                                  }: PhoneStepProps) {
    const { colors } = useTheme();
    const [showError, setShowError] = useState(false);
    const [shakeAnimation] = useState(new Animated.Value(0));
    const [formattedPhoneNumber, setFormattedPhoneNumber] = useState('');

    const validatePhoneNumber = (number: string) => {
        return number.replace(/\D/g, '').length === 9;
    };

    const formatPhoneNumber = (number: string) => {
        const cleaned = number.replace(/\D/g, '');
        let formatted = '';
        for (let i = 0; i < cleaned.length; i++) {
            if (i === 1 || i === 3 || i === 5 || i === 7) {
                formatted += ' ';
            }
            formatted += cleaned[i];
        }
        return formatted;
    };

    useEffect(() => {
        setFormattedPhoneNumber(formatPhoneNumber(phoneNumber));
    }, [phoneNumber]);

    const handlePhoneChange = (text: string) => {
        const unformatted = text.replace(/\D/g, '');
        onPhoneChange(unformatted);
        if (showError) {
            setShowError(false);
        }
    };

    const handleContinue = () => {
        if (!validatePhoneNumber(phoneNumber)) {
            setShowError(true);
            Animated.sequence([
                Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
                Animated.timing(shakeAnimation, { toValue: -10, duration: 100, useNativeDriver: true }),
                Animated.timing(shakeAnimation, { toValue: 0, duration: 100, useNativeDriver: true })
            ]).start();
        } else {
            setShowError(false);
            onContinue();
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
                Écrivez votre numéro de téléphone
            </Text>

            <View className="flex-1 px-2 mb-6">
                <Animated.View style={{ transform: [{ translateX: shakeAnimation }] }}>
                    <View className="relative">
                        <View className="flex-row items-center">
                            <Text className="text-lg mr-2" style={{ color: colors.text }}>+212</Text>
                            <TextInput
                                className={`flex-1 h-16 px-4 text-xl font-sans rounded-lg bg-gray-50 ${
                                    showError ? 'border border-red-500' : ''
                                }`}
                                style={{
                                    color: Colors.light.text,
                                    backgroundColor: '#F9FAFB'
                                }}
                                value={formattedPhoneNumber}
                                onChangeText={handlePhoneChange}
                                placeholder="6 12 34 56 78"
                                placeholderTextColor={Colors.light.placeholder}
                                keyboardType="phone-pad"
                                maxLength={14}
                            />
                        </View>
                        <View className="absolute right-3 top-5">
                            <SignupPhone/>
                        </View>
                    </View>
                    {showError && (
                        <Text className="text-red-500 text-sm mt-4">
                            Veuillez entrer un numéro de téléphone valide
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
