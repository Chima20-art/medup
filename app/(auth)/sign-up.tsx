import * as React from 'react'
import {
    Text,
    TextInput,
    TouchableOpacity,
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Dimensions,
    Image
} from 'react-native'
import { useSignUp } from '@clerk/clerk-expo'
import { router, Link } from "expo-router"
import { ChevronLeft } from 'lucide-react-native'
import DateOfBirthStep from "@/components/age-step";
import NameStep from "@/components/name-step";
import EmailStep from "@/components/email-step";
import PhoneStep from "@/components/phone-step";
import PasswordStep from "@/components/pasword-step";

export default function SignUpScreen() {
    const { isLoaded, signUp, setActive } = useSignUp()
    const [step, setStep] = React.useState(1)

    // Form state
    const [firstName, setFirstName] = React.useState('')
    const [lastName, setLastName] = React.useState('')
    const [age, setAge] = React.useState(18)
    const [emailAddress, setEmailAddress] = React.useState('')
    const [phoneNumber, setPhoneNumber] = React.useState('')
    const [password, setPassword] = React.useState('')

    // Verification state
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
        try {
            const signUpAttempt = await signUp.attemptEmailAddressVerification({
                code,
            })
            if (signUpAttempt.status === 'complete') {
                await setActive({ session: signUpAttempt.createdSessionId })
                router.replace("/dashboard")
            }
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2))
        } finally {
            setIsVerifying(false)
        }
    }

    const renderStepContent = () => {
        if (pendingVerification) {
            return (
                <View className="flex-1 px-6">

                    {/* Title in French */}
                    <Text className="text-2xl font-bold text-center mt-8 mb-2">
                        Code de vérification
                    </Text>

                    {/* Name Input */}
                    <View className="flex-1">
                        <TextInput
                            className="w-full h-12 border-b border-gray-300 px-2 text-center" // added text-center to center placeholder
                            value={code}
                            onChangeText={setCode}
                            placeholder="Code de vérification" // placeholder in French
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    {/* Continue Button in French */}
                    <TouchableOpacity
                        className="w-full h-14 bg-[#E91E63] rounded-full items-center justify-center mb-8"
                        onPress={onPressVerify}
                        disabled={isVerifying}
                    >
                        <Text className="text-white text-lg font-semibold">
                            <Text style={styles.buttonText}>
                                            {isVerifying ? "Vérification..." : "Vérifier l'email"}
                            </Text>
                        </Text>
                    </TouchableOpacity>
                </View>


            )
        }

        switch (step) {
            case 1:
                return (
                    <NameStep name={firstName} onNameChange={setFirstName} onContinue={()=> setStep(2)}/>
                )
            case 2:
                return (
                    <DateOfBirthStep
                        selectedAge={age}
                        onAgeChange={setAge}
                        onContinue={() => setStep(3)}
                    />
                )
            case 3:
                return (
                    <EmailStep emailAddress={emailAddress} onEmailChange={setEmailAddress} onContinue={() => setStep(4)}/>
                )
                case 4:
                return (
                    <PhoneStep phoneNumber={phoneNumber} onPhoneChange={setPhoneNumber} onContinue={() => setStep(5)}/>
                )
            case 5:
                return (
                    <PasswordStep  password={password} onPasswordChange={setPassword} onContinue={() => onSignUpPress()}/>

                        )
        }
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {step > 1 && !pendingVerification && (
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => setStep(step - 1)}
                    >
                        <ChevronLeft size={24} color="#666" />
                    </TouchableOpacity>
                )}
                <Image
                    source={require('@/assets/images/Logo.png')}
                    className="h-32 mt-16 mx-auto"
                    resizeMode="contain"
                />


                {renderStepContent()}
                {!pendingVerification && (
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Déjà un compte ?</Text>
                        <Link href="/sign-in" asChild>
                            <TouchableOpacity>
                                <Text style={styles.link}>Se connecter</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                )}
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
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        zIndex: 1,
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
    stepTitle: {
        fontSize: 18,
        color: '#333',
        fontWeight: '600',
        marginBottom: 20,
        textAlign: 'center',
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