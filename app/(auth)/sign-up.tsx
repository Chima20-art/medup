import * as React from 'react'
import { Text, TextInput, TouchableOpacity, View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Dimensions } from 'react-native'
import { useSignUp } from '@clerk/clerk-expo'
import { router, Link } from "expo-router"

export default function SignUpScreen() {
    const { isLoaded, signUp, setActive } = useSignUp()

    const [firstName, setFirstName] = React.useState('')
    const [lastName, setLastName] = React.useState('')
    const [emailAddress, setEmailAddress] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [pendingVerification, setPendingVerification] = React.useState(false)
    const [code, setCode] = React.useState('')
    const [isSigningUp, setIsSigningUp] = React.useState(false)
    const [isVerifying, setIsVerifying] = React.useState(false)

    const onSignUpPress = async () => {
        if (!isLoaded) return
        setIsSigningUp(true)
        try {
            await signUp.create({
                emailAddress,
                password,
            })
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
            setPendingVerification(true)
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2))
        } finally {
            setIsSigningUp(false)
        }
    }

    const onPressVerify = async () => {
        if (!isLoaded) return
        setIsVerifying(true)
        console.log("onPress verify")
        try {
            const signUpAttempt = await signUp.attemptEmailAddressVerification({
                code,
            })
            if (signUpAttempt.status === 'complete') {
                await setActive({ session: signUpAttempt.createdSessionId })
                router.replace("/dashboard")
            } else {
                console.error(JSON.stringify(signUpAttempt, null, 2))
            }
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2))
        } finally {
            setIsVerifying(false)
        }
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.logoContainer}>
                    <Text style={styles.logoTextBold}>MED</Text>
                    <Text style={styles.logoTextLight}>up</Text>
                </View>
                <Text style={styles.subtitle}>
                    {pendingVerification ? "Verify your email" : "Creer un compte"}
                </Text>
                {!pendingVerification ? (
                    <View style={styles.formContainer}>
                        <TextInput
                            style={styles.input}
                            autoCapitalize="words"
                            value={firstName}
                            placeholder="First Name"
                            onChangeText={setFirstName}
                            placeholderTextColor="#999"
                        />
                        <TextInput
                            style={styles.input}
                            autoCapitalize="words"
                            value={lastName}
                            placeholder="Last Name"
                            onChangeText={setLastName}
                            placeholderTextColor="#999"
                        />
                        <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            value={emailAddress}
                            placeholder="Email"
                            onChangeText={setEmailAddress}
                            keyboardType="email-address"
                            placeholderTextColor="#999"
                        />
                        <TextInput
                            style={styles.input}
                            value={password}
                            placeholder="Password"
                            secureTextEntry={true}
                            onChangeText={setPassword}
                            placeholderTextColor="#999"
                        />
                        <TouchableOpacity
                            style={styles.button}
                            onPress={onSignUpPress}
                            disabled={isSigningUp}
                        >
                            <Text style={styles.buttonText}>
                                {isSigningUp ? "Signing Up..." : "Sign Up"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.formContainer}>
                        <TextInput
                            style={styles.input}
                            value={code}
                            placeholder="Verification Code"
                            onChangeText={setCode}
                            keyboardType="number-pad"
                            placeholderTextColor="#999"
                        />
                        <TouchableOpacity
                            style={styles.button}
                            onPress={onPressVerify}
                            disabled={isVerifying}
                        >
                            <Text style={styles.buttonText}>
                                {isVerifying ? "Verifying..." : "Verify Email"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account?</Text>
                    <Link href="/sign-in" asChild>
                        <TouchableOpacity>
                            <Text style={styles.link}>Sign in</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const { width } = Dimensions.get('window')

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    logoContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    logoTextBold: {
        fontSize: 32,
        fontWeight: '700',
        color: '#1A1A1A',
        letterSpacing: -0.5,
    },
    logoTextLight: {
        fontSize: 32,
        fontWeight: '400',
        color: '#1A1A1A',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 20,
        color: '#666666',
        fontWeight: '400',
        textAlign: 'center',
        marginBottom: 30,
    },
    formContainer: {
        width: '100%',
        alignItems: 'center',
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