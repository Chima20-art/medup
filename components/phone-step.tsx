import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { Check, X } from 'lucide-react-native'
import { useTheme } from '@react-navigation/native'

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
    const { colors } = useTheme()
    const [isValid, setIsValid] = useState(false)
    const [formattedPhoneNumber, setFormattedPhoneNumber] = useState('')

    const validatePhoneNumber = (number: string) => {
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
            <View className="h-16 flex-row items-center justify-center px-5">
                <View className="flex flex-row gap-x-0.5">
                    {[1, 2, 3, 4, 5, 6].map((step) => (
                        <View
                            key={step}
                            className={`h-1 w-10 rounded-full`}
                            style={{
                                backgroundColor: step <= 4 ? colors.primary : colors.border
                            }}
                        />
                    ))}
                </View>
            </View>

            <Text className="text-2xl font-bold text-center mt-8 mb-2" style={{ color: colors.text }}>
                Écrivez votre numéro de téléphone
            </Text>

            <View className="flex-1 mt-4">
                <View className="flex-row items-center border-b border-gray-300">
                    <Text className="text-lg mr-2" style={{ color: colors.text }}>+212</Text>
                    <TextInput
                        value={formattedPhoneNumber}
                        onChangeText={handlePhoneChange}
                        placeholder="6 12 34 56 78"
                        placeholderTextColor={colors.border}
                        keyboardType="phone-pad"
                        style={{ flex: 1, fontSize: 18, color: colors.text, paddingVertical: 8 }}
                        maxLength={14}
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
                <Text className="text-sm mt-2 text-center" style={{ color: colors.text }}>
                    Nous vous enverrons un code de vérification par SMS
                </Text>
            </View>

            <TouchableOpacity
                className={`w-full h-14 rounded-full items-center justify-center mb-4`}
                style={{ backgroundColor: isValid ? colors.primary : colors.border }}
                onPress={onContinue}
                disabled={!isValid}
            >
                <Text className="text-lg font-semibold" style={{ color: colors.background }}>
                    Continuer
                </Text>
            </TouchableOpacity>
        </View>
    )
}