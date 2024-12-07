import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { useSignIn } from '@clerk/clerk-expo'
import { Eye, EyeOff } from 'lucide-react-native'
import { useTheme } from '@react-navigation/native'

export default function SignInForm() {
    const { colors } = useTheme()
    const { signIn, setActive, isLoaded } = useSignIn()
    const [emailAddress, setEmailAddress] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isSigningIn, setIsSigningIn] = useState(false)

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
        <View className="space-y-4">
            <View>
                <Text className="font-sans mb-2" style={{ color: colors.text }}>E-mail</Text>
                <TextInput
                    className="bg-gray-100 p-5 rounded-lg mb-4"
                    style={{ color: colors.text }}
                    value={emailAddress}
                    onChangeText={setEmailAddress}
                    placeholder="johndoe@gmail.com"
                    placeholderTextColor={colors.border}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                />
            </View>

            <View>
                <Text className="font-sans mb-2" style={{ color: colors.text }}>Password</Text>
                <View className="flex-row items-center bg-gray-100 rounded-lg">
                    <TextInput
                        className="flex-1 p-5"
                        style={{ color: colors.text }}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="••••••••••••"
                        placeholderTextColor={colors.border}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="pr-4">
                        {showPassword ? <EyeOff color={colors.text} size={24} /> : <Eye color={colors.text} size={24} />}
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity
                className="bg-primary py-4 rounded-lg mt-16 w-full mx-auto"
                onPress={onSignInPress}
                disabled={isSigningIn}
            >
                <Text className="text-white text-center font-semibold ">
                    {isSigningIn ? 'Connexion...' : 'Entrer'}
                </Text>
            </TouchableOpacity>
        </View>
    )
}

