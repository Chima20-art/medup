import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import { Check, X } from 'lucide-react-native'

interface PhoneStepProps {
    phoneNumber: string
    onPhoneChange: (value: string) => void
    onContinue: () => void
}

export default function PhoneStep({
                                      phoneNumber,
                                      onPhoneChange,
                                      onContinue
                                  }: PhoneStepProps) {
    const [isValid, setIsValid] = useState(false)
    const [formattedPhoneNumber, setFormattedPhoneNumber] = useState('')

    const validatePhoneNumber = (number: string) => {
        // Remove non-digit characters and check if the resulting string has 9 digits
        return number.replace(/\D/g, '').length === 9
    }

    const formatPhoneNumber = (number: string) => {
        const cleaned = number.replace(/\D/g, '')
        let formatted = ''
        for (let i = 0; i < cleaned.length; i++) {
            if (i === 1 || i === 3 || i === 5 || i === 7) {
                formatted += ' '
            }
            formatted += cleaned[i]
        }
        return formatted
    }

    useEffect(() => {
        const isValidNumber = validatePhoneNumber(phoneNumber)
        setIsValid(isValidNumber)
        setFormattedPhoneNumber(formatPhoneNumber(phoneNumber))
    }, [phoneNumber])

    const handlePhoneChange = (text: string) => {
        const unformatted = text.replace(/\D/g, '')
        onPhoneChange(unformatted)
    }

    return (
        <View className="flex-1 px-6">
            {/* Header */}
            <View className="h-16 flex-row items-center justify-center px-5">
                <View className="flex-row space-x-1">
                    {[1, 2, 3, 4, 5].map((step) => (
                        <View
                            key={step}
                            className={`h-1 w-5 rounded-full ${
                                step <= 4 ? 'bg-[#E91E63]' : 'bg-gray-200'
                            }`}
                        />
                    ))}
                </View>
            </View>

            {/* Title in French */}
            <Text className="text-2xl font-bold text-center mt-8 mb-2">
                Écrivez votre numéro de téléphone
            </Text>

            {/* Phone Input */}
            <View className="flex-1 mt-4">
                <View className="flex-row items-center border-b border-gray-300">
                    <Text className="text-lg text-gray-500 mr-2">+212</Text>
                    <TextInput
                        value={formattedPhoneNumber}
                        onChangeText={handlePhoneChange}
                        placeholder="6 12 34 56 78"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="phone-pad"
                        style={styles.input}
                        maxLength={14} // 9 digits + 5 spaces
                    />
                    {phoneNumber.length > 0 && (
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
                    Nous vous enverrons un code de vérification par SMS
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

const styles = StyleSheet.create({
    input: {
        flex: 1,
        fontSize: 18,
        color: '#000',
        paddingVertical: 8,
    },
})