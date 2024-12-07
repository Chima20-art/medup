import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native'
import { useTheme } from '@react-navigation/native'
import Signup3 from "@/assets/images/signup-3.svg"

interface VerificationStepProps {
    code: string
    onCodeChange: (value: string) => void
    onVerify: () => void
    isVerifying: boolean
}

export default function VerificationStep({
                                             code,
                                             onCodeChange,
                                             onVerify,
                                             isVerifying
                                         }: VerificationStepProps) {
    const { colors } = useTheme()

    return (
        <View className="flex-1 px-6">
            <View style={{ marginHorizontal: 'auto' }}>
                <Signup3 width={250} height={250} />
            </View>
            <View className="h-16 flex-row items-center justify-center px-5">
                <View className="flex flex-row gap-x-0.5">
                    {[1, 2, 3, 4, 5, 6].map((s) => (
                        <View
                            key={s}
                            className={`h-1 w-10 rounded-full ${
                                s <= 3 ? 'bg-primary' : 'bg-gray-200'
                            }`}
                            style={{ backgroundColor: s <= 3 ? colors.primary : colors.border }}
                        />
                    ))}
                </View>
            </View>

            <Text className="text-2xl font-bold text-center mt-8 mb-2" style={{ color: colors.text }}>
                Vérifier le compte
            </Text>

            <Text className="text-sm text-center mb-4" style={{ color: colors.text }}>
                Saisissez le code à 6 chiffres que nous vous avons envoyé par email
            </Text>

            <View className="flex-1">
                <TextInput
                    className="w-full h-12 border-b px-2 text-center text-lg"
                    style={{ borderBottomColor: colors.border, color: colors.text }}
                    value={code}
                    onChangeText={onCodeChange}
                    placeholder="Code de vérification"
                    placeholderTextColor={colors.text}
                    keyboardType="number-pad"
                    maxLength={6}
                />
            </View>

            <TouchableOpacity
                className="w-full h-14 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: colors.primary }}
                onPress={onVerify}
                disabled={isVerifying}
            >
                <Text className="text-lg font-semibold" style={{ color: colors.card }}>
                    {isVerifying ? "Vérification..." : "Vérifier l'email"}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity>
                <Text className="text-center" style={{ color: colors.primary }}>
                    Renvoyer le code
                </Text>
            </TouchableOpacity>
        </View>
    )
}

