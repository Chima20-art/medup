import React from 'react'
import { useSignIn } from '@clerk/clerk-expo'
import { Link, router, Stack } from 'expo-router'
import {
    View,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Text,
    KeyboardAvoidingView,
    Platform,
    Animated,
    Dimensions,
} from 'react-native'

export default function Page() {
    const { signIn, setActive, isLoaded } = useSignIn()
    const [emailAddress, setEmailAddress] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [isSigningIn, setIsSigningIn] = React.useState(false)

    const fadeAnim = React.useRef(new Animated.Value(0)).current

    React.useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start()
    }, [])

    const onSignInPress = React.useCallback(async () => {
        if (!isLoaded) return
        setIsSigningIn(true)
        try {
            const signInAttempt = await signIn.create({
                identifier: emailAddress,
                password,
            })

            if (signInAttempt.status === 'complete') {
                await setActive({ session: signInAttempt.createdSessionId })
                router.replace('/dashboard')
            } else {
                console.error(JSON.stringify(signInAttempt, null, 2))
            }
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2))
        } finally {
            setIsSigningIn(false)
        }
    }, [isLoaded, emailAddress, password])

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <Animated.View style={[styles.innerContainer, { opacity: fadeAnim }]}>
                <Stack.Screen
                    options={{
                        title: 'Sign In',
                        headerShown: false,
                    }}
                />
                <Text style={styles.subtitle}>Se connecter</Text>
                <TextInput
                    autoCapitalize="none"
                    value={emailAddress}
                    placeholder="Email"
                    onChangeText={setEmailAddress}
                    style={styles.input}
                    placeholderTextColor="#999"
                />
                <TextInput
                    value={password}
                    placeholder="Password"
                    secureTextEntry={true}
                    onChangeText={setPassword}
                    style={styles.input}
                    placeholderTextColor="#999"
                />
                <TouchableOpacity
                    onPress={onSignInPress}
                    style={styles.button}
                    disabled={isSigningIn}
                >
                    <Text style={styles.buttonText}>
                        {isSigningIn ? 'Signing In...' : 'Sign In'}
                    </Text>
                </TouchableOpacity>
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Don't have an account?</Text>
                    <Link href="/sign-up" asChild>
                        <TouchableOpacity>
                            <Text style={styles.link}>Sign up</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </Animated.View>
        </KeyboardAvoidingView>
    )
}

const { width } = Dimensions.get('window')

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5',
    },
    innerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 30,
    },
    input: {
        width: width * 0.85,
        height: 50,
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 15,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#333',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    button: {
        width: width * 0.85,
        height: 50,
        backgroundColor: '#4a90e2',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    footerText: {
        fontSize: 14,
        color: '#666',
    },
    link: {
        marginLeft: 5,
        color: '#4a90e2',
        fontWeight: 'bold',
    },
})