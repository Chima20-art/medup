import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { useSignIn } from '@clerk/clerk-expo'
import { Eye, EyeOff, Check, X } from 'lucide-react-native'
import { useTheme } from '@react-navigation/native'

export default function SignInForm() {
    const { colors } = useTheme()
    const { signIn, setActive, isLoaded } = useSignIn()
    const [emailAddress, setEmailAddress] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isSigningIn, setIsSigningIn] = useState(false)

    const isEmailValid = emailAddress.includes('@') && emailAddress.includes('.')
    const isPasswordValid = password.length >= 8

    const onSignInPress = async () => {
        if (!isLoaded) return
        setIsSigningIn(true)
        try {
            const signInAttempt = await signIn.create({
                identifier: emailAddress,
                password,
            })

            if (signInAttempt.status === 'complete') {
                await setActive({ session: signInAttempt.createdSessionId })
                // Navigate to dashboard (you'll need to implement this navigation)
            } else {
                console.error(JSON.stringify(signInAttempt, null, 2))
            }
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2))
        } finally {
            setIsSigningIn(false)
        }
    }

    return (
        <View className="flex-1 px-6">
            <Text className="text-2xl font-bold text-center mt-8 mb-2" style={{ color: colors.text }}>
                Se connecter
            </Text>

            <View className="flex-1 mt-4">
                <View className="flex-row items-center border-b border-gray-300 mb-4">
                    <TextInput
                        className="flex-1 h-12 px-2 text-lg"
                        style={{ color: colors.text }}
                        value={emailAddress}
                        onChangeText={setEmailAddress}
                        placeholder="Votre adresse e-mail"
                        placeholderTextColor={colors.border}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="email-address"
                    />
                    {emailAddress.length > 0 && (
                        <View className="ml-2">
                            {isEmailValid ? (
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
                        value={password}
                        onChangeText={setPassword}
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

                <Text className="text-sm mt-4 text-center" style={{ color: colors.text }}>
                    Le mot de passe doit contenir au moins 8 caractères.
                </Text>
            </View>

            <View>
                <TouchableOpacity
                    className={`w-full h-14 rounded-full items-center justify-center`}
                    style={{ backgroundColor: isEmailValid && isPasswordValid ? colors.primary : colors.border }}
                    onPress={onSignInPress}
                    disabled={!isEmailValid || !isPasswordValid || isSigningIn}
                >
                    <Text className="text-lg font-semibold" style={{ color: colors.background }}>
                        {isSigningIn ? 'Connexion...' : 'Se connecter'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}