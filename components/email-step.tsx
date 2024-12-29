import React, { useState, useEffect } from 'react'
import {View, Text, TextInput, TouchableOpacity, Image} from 'react-native'
import { Check, X } from 'lucide-react-native'
import { useTheme } from '@react-navigation/native'
import Signup2 from "@/assets/images/signup-2.svg";
import Signup1 from "@/assets/images/signup-1.svg";
import Logo from "@/assets/images/logo.svg";
import {CircularButton} from "@/components/Cicular-button";

interface EmailStepProps {
    emailAddress: string
    onEmailChange: (value: string) => void
    onContinue: () => void,
    currentStep?: number;
    totalSteps?: number;
}

export default function EmailStep({
                                      emailAddress,
                                      onEmailChange,
                                      onContinue,
                                      currentStep = 2,
                                      totalSteps = 6
                                  }: EmailStepProps) {
    const { colors } = useTheme()
    const [isValid, setIsValid] = useState(false)

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    useEffect(() => {
        setIsValid(validateEmail(emailAddress))
    }, [emailAddress])

    return (
        <View className="flex-1 px-6 pt-16">
            <View className="mx-auto">
                <Logo/>
            </View>
            <View className="h-16 flex-row items-center justify-center px-5">
                <View className="flex flex-row gap-x-0.5">
                    {[1, 2, 3, 4, 5, 6].map((step) => (
                        <View
                            key={step}
                            className={`h-1 w-10 rounded-full`}
                            style={{
                                backgroundColor: step <= 2 ? colors.primary : colors.border
                            }}
                        />
                    ))}
                </View>
            </View>

            <Text className="text-2xl font-bold text-center mt-8 mb-2" style={{ color: colors.text }}>
                Nous vons enverrons un code de vérification par Mail
            </Text>

            <View className="flex-1 mt-4">
                <View className="flex-row items-center border-b border-gray-300">
                    <TextInput
                        className="flex-1 h-12 px-2 text-center text-lg"
                        style={{ color: colors.text }}
                        value={emailAddress}
                        onChangeText={onEmailChange}
                        placeholder="exemple@email.com"
                        placeholderTextColor={colors.border}
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
                <Text className="text-sm mt-2 text-center" style={{ color: colors.text }}>
                    Nous utiliserons cette adresse pour vous envoyer des informations importantes
                </Text>
            </View>

            <View className="items-center mb-4">
                <CircularButton
                    onPress={onContinue}
                    disabled={!isValid}
                    currentStep={currentStep}
                    totalSteps={totalSteps}
                />
            </View>
        </View>
    )
}