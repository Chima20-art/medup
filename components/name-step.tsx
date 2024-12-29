import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Logo from '@/assets/images/logo.svg';
import { CircularButton } from '@/components/Cicular-button';

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
    const { colors } = useTheme();

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

            <Text className="text-2xl font-bold text-center mt-8 mb-2" style={{ color: colors.text }}>
                Écrivez votre nom d'utilisateur
            </Text>

            <View className="flex-1">
                <TextInput
                    className="w-full h-12 border-b px-2 text-center text-lg"
                    style={{ borderBottomColor: colors.border, color: colors.text }}
                    value={name}
                    onChangeText={onNameChange}
                    placeholder="Entrez votre nom ou surnom"
                    placeholderTextColor={colors.text}
                />
            </View>

            <View className="items-center mb-4">
                <CircularButton
                    onPress={onContinue}
                    disabled={!name.trim()}
                    currentStep={currentStep}
                    totalSteps={totalSteps}
                />
            </View>
        </View>
    );
}

