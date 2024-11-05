import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import { Check, X } from 'lucide-react-native'

interface EmailStepProps {
    emailAddress: string
    onEmailChange: (value: string) => void
    onContinue: () => void
}

export default function EmailStep({
                                      emailAddress,
                                      onEmailChange,
                                      onContinue
                                  }: EmailStepProps) {
    const [isValid, setIsValid] = useState(false)

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    useEffect(() => {
        setIsValid(validateEmail(emailAddress))
    }, [emailAddress])

    return (
        <View className="flex-1 px-6">
            {/* Header */}
            <View className="h-16 flex-row items-center justify-center px-5">
                <View className="flex-row space-x-1">
                    {[1, 2, 3, 4, 5].map((step) => (
                        <View
                            key={step}
                            className={`h-1 w-5 rounded-full ${
                                step <= 3 ? 'bg-[#E91E63]' : 'bg-gray-200'
                            }`}
                        />
                    ))}
                </View>
            </View>

            {/* Title in French */}
            <Text className="text-2xl font-bold text-center mt-8 mb-2">
                Écrivez votre adresse e-mail
            </Text>

            {/* Email Input */}
            <View className="flex-1 mt-4">
                <View className="flex-row items-center border-b border-gray-300">
                    <TextInput
                        className="flex-1 h-12 px-2 text-center text-lg"
                        value={emailAddress}
                        onChangeText={onEmailChange}
                        placeholder="exemple@email.com"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {emailAddress.length > 0 && (
                        <View className="ml-2">
                            {isValid ? (
                                <Check color="#10B981" size={24} />
                            ) : (
                                <X color="#EF4444" size={24} />
                            )}
                        </View>
                    )}
                </View>
                <Text className="text-sm text-gray-500 mt-2 text-center">
                    Nous utiliserons cette adresse pour vous envoyer des informations importantes
                </Text>
            </View>

            {/* Continue Button in French */}
            <TouchableOpacity
                className={`w-full h-14 rounded-full items-center justify-center mb-8 ${
                    isValid ? 'bg-[#E91E63]' : 'bg-gray-300'
                }`}
                onPress={onContinue}
                disabled={!isValid}
            >
                <Text className="text-white text-lg font-semibold">
                    Continuer
                </Text>
            </TouchableOpacity>

        </View>
    )
}