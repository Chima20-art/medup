import React from 'react'
import {View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Animated, Image} from 'react-native'
import { Link, Stack } from 'expo-router'
import SignInForm from "@/components/SignInForm";
import {useTheme} from "@react-navigation/native";


export default function Page() {
    const fadeAnim = React.useRef(new Animated.Value(0)).current
    const { colors } = useTheme()

    React.useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start()
    }, [])

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1"
        >
            <Image
                source={require('@/assets/images/Logo.png')}
                className="h-32 mt-16 mx-auto"
                resizeMode="contain"
            />
            <Animated.View className="flex-1 justify-center items-center p-5" style={{ opacity: fadeAnim }}>
                <Stack.Screen
                    options={{
                        title: 'Sign In',
                        headerShown: false,
                    }}
                />
                <SignInForm />
                <View className="flex-row justify-center mt-5 mb-0">
                    <Text style={{ color: colors.text }}>Vous n'avez pas de compte ?</Text>
                    <Link href="/sign-up" asChild>
                        <TouchableOpacity>
                            <Text className="ml-1 font-bold" style={{ color: colors.primary }}>S'inscrire</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </Animated.View>
        </KeyboardAvoidingView>
    )
}