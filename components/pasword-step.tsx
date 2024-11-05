import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { Check, X, Eye, EyeOff } from 'lucide-react-native'

interface PasswordStepProps {
    password: string
    onPasswordChange: (value: string) => void
    onContinue: () => void
}

export default function PasswordStep({
                                         password,
                                         onPasswordChange,
                                         onContinue
                                     }: PasswordStepProps) {
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
        <View className="flex-1 px-6">
            <View className="h-16 flex-row items-center justify-center px-5">
                <View className="flex-row space-x-1">
                    {[1, 2, 3, 4, 5].map((step) => (
                        <View
                            key={step}
                            className={`h-1 w-5 rounded-full ${
                                step <= 5 ? 'bg-[#E91E63]' : 'bg-gray-200'
                            }`}
                        />
                    ))}
                </View>
            </View>

            <Text className="text-2xl font-bold text-center mt-8 mb-2">
                Créez votre mot de passe
            </Text>

            <View className="flex-1 mt-4">
                <View className="flex-row items-center border-b border-gray-300 mb-4">
                    <TextInput
                        className="flex-1 h-12 px-2 text-lg"
                        value={password}
                        onChangeText={onPasswordChange}
                        placeholder="Votre mot de passe"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="px-2">
                        {showPassword ? <EyeOff color="#9CA3AF" size={24} /> : <Eye color="#9CA3AF" size={24} />}
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
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Confirmez votre mot de passe"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} className="px-2">
                        {showConfirmPassword ? <EyeOff color="#9CA3AF" size={24} /> : <Eye color="#9CA3AF" size={24} />}
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

                <Text className="text-sm text-gray-500 mt-4 text-center">
                    Le mot de passe doit contenir au moins 8 caractères, incluant des lettres et des chiffres.
                </Text>
            </View>

            <TouchableOpacity
                className={`w-full h-14 rounded-full items-center justify-center mb-8 ${
                    isPasswordValid && doPasswordsMatch ? 'bg-[#E91E63]' : 'bg-gray-300'
                }`}
                onPress={onContinue}
                disabled={!isPasswordValid || !doPasswordsMatch}
            >
                <Text className="text-white text-lg font-semibold">
                    Continuer
                </Text>
            </TouchableOpacity>
        </View>
    )
}