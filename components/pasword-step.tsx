import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { Check, X, Eye, EyeOff } from 'lucide-react-native'
import { useTheme } from '@react-navigation/native'
import Signup7 from "@/assets/images/signup-7.svg";
import Logo from "@/assets/images/logo.svg";
import {CircularButton} from "@/components/Cicular-button";

interface PasswordStepProps {
    password: string
    onPasswordChange: (value: string) => void
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
    const { colors } = useTheme()
    const [confirmPassword, setConfirmPassword] = useState('')
    const [isPasswordValid, setIsPasswordValid] = useState(false)
    const [doPasswordsMatch, setDoPasswordsMatch] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const validatePassword = (pass: string) => {
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]{8,}$/
        return passwordRegex.test(pass)
    }

    useEffect(() => {
        setIsPasswordValid(validatePassword(password))
        setDoPasswordsMatch(password === confirmPassword && password !== '')
    }, [password, confirmPassword])

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
                                backgroundColor: step <= 3 ? colors.primary : colors.border
                            }}
                        />
                    ))}
                </View>
            </View>

            <Text className="text-2xl font-bold text-center mt-8 mb-2" style={{ color: colors.text }}>
                Créez votre mot de passe
            </Text>

            <View className="flex-1 mt-4">
                <View className="flex-row items-center border-b border-gray-300 mb-4">
                    <TextInput
                        className="flex-1 h-12 px-2 text-lg"
                        style={{ color: colors.text }}
                        value={password}
                        onChangeText={onPasswordChange}
                        placeholder="Votre mot de passe"
                        placeholderTextColor={colors.border}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="px-2">
                        {showPassword ? <EyeOff color={colors.text} size={24} /> : <Eye color={colors.text} size={24} />}
                    </TouchableOpacity>
                    {password.length > 0 && (
                        <View className="ml-2">
                            {isPasswordValid ? (
                                <Check color="#10B981" size={24} />
                            ) : (
                                <X color="#EF4444" size={24} />
                            )}
                        </View>
                    )}
                </View>

                <View className="flex-row items-center border-b border-gray-300">
                    <TextInput
                        className="flex-1 h-12 px-2 text-lg"
                        style={{ color: colors.text }}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Confirmez votre mot de passe"
                        placeholderTextColor={colors.border}
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} className="px-2">
                        {showConfirmPassword ? <EyeOff color={colors.text} size={24} /> : <Eye color={colors.text} size={24} />}
                    </TouchableOpacity>
                    {confirmPassword.length > 0 && (
                        <View className="ml-2">
                            {doPasswordsMatch ? (
                                <Check color="#10B981" size={24} />
                            ) : (
                                <X color="#EF4444" size={24} />
                            )}
                        </View>
                    )}
                </View>

                <Text className="text-sm mt-4 text-center" style={{ color: colors.text }}>
                    Le mot de passe doit contenir au moins 8 caractères, incluant des lettres et des chiffres.
                </Text>
            </View>

            <View className="items-center mb-4">
                <CircularButton
                    onPress={onContinue}
                    disabled={!isPasswordValid || !doPasswordsMatch}
                    currentStep={currentStep}
                    totalSteps={totalSteps}
                />
            </View>
        </View>
    )
}