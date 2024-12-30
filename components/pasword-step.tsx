import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Animated } from 'react-native';
import { Check, X, Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '@react-navigation/native';
import Logo from "@/assets/images/logo.svg";
import { CircularButton } from "@/components/Cicular-button";
import { Colors } from "@/constants/Colors";

interface PasswordStepProps {
    password: string;
    onPasswordChange: (value: string) => void;
    onContinue: () => void;
    currentStep: number;
    totalSteps: number;
}

export default function PasswordStep({
                                         password,
                                         onPasswordChange,
                                         onContinue,
                                         currentStep,
                                         totalSteps
                                     }: PasswordStepProps) {
    const { colors } = useTheme();
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showError, setShowError] = useState(false);
    const [shakeAnimation] = useState(new Animated.Value(0));

    const validatePassword = (pass: string) => {
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
        return passwordRegex.test(pass);
    };

    const handleContinue = () => {
        if (!validatePassword(password) || password !== confirmPassword) {
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

    const handlePasswordChange = (text: string) => {
        onPasswordChange(text);
        if (showError) {
            setShowError(false);
        }
    };

    const handleConfirmPasswordChange = (text: string) => {
        setConfirmPassword(text);
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
                Créez votre mot de passe
            </Text>

            <View className="flex-1 px-2 mb-6">
                <Animated.View style={{ transform: [{ translateX: shakeAnimation }] }}>
                    <View className="relative mb-4">
                        <TextInput
                            className={`w-full h-16 px-4 text-xl font-sans rounded-lg bg-gray-50 ${
                                showError ? 'border border-red-500' : ''
                            }`}
                            style={{
                                color: Colors.light.text,
                                backgroundColor: '#F9FAFB'
                            }}
                            value={password}
                            onChangeText={handlePasswordChange}
                            placeholder="Votre mot de passe"
                            placeholderTextColor={Colors.light.placeholder}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-5"
                        >
                            {showPassword ?
                                <EyeOff size={24} color={Colors.light.placeholder} opacity={0.5} /> :
                                <Eye size={24} color={Colors.light.placeholder} opacity={0.5} />
                            }
                        </TouchableOpacity>
                    </View>
                    <View className="relative">
                        <TextInput
                            className={`w-full h-16 px-4 text-xl font-sans rounded-lg bg-gray-50 ${
                                showError ? 'border border-red-500' : ''
                            }`}
                            style={{
                                color: Colors.light.text,
                                backgroundColor: '#F9FAFB'
                            }}
                            value={confirmPassword}
                            onChangeText={handleConfirmPasswordChange}
                            placeholder="Confirmez votre mot de passe"
                            placeholderTextColor={Colors.light.placeholder}
                            secureTextEntry={!showConfirmPassword}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <TouchableOpacity
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-5"
                        >
                            {showConfirmPassword ?
                                <EyeOff size={24} color={Colors.light.placeholder} opacity={0.5} /> :
                                <Eye size={24} color={Colors.light.placeholder} opacity={0.5} />
                            }
                        </TouchableOpacity>
                    </View>
                    {showError && (
                        <Text className="text-red-500 text-sm mt-4">
                            Les mots de passe ne correspondent pas ou ne respectent pas les critères
                        </Text>
                    )}
                </Animated.View>
                <Text className="text-sm mt-4 text-center" style={{ color: colors.text }}>
                    Le mot de passe doit contenir au moins 8 caractères, incluant des lettres et des chiffres.
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
