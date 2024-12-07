import * as React from 'react'
import {
    Text,
    TouchableOpacity,
    View,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native'
import { useSignUp } from '@clerk/clerk-expo'
import { router, Link } from "expo-router"
import { ChevronLeft } from 'lucide-react-native'
import { useTheme } from '@react-navigation/native'
import DateOfBirthStep from "@/components/age-step"
import NameStep from "@/components/name-step"
import EmailStep from "@/components/email-step"
import PhoneStep from "@/components/phone-step"
import PasswordStep from "@/components/pasword-step"
import VerificationStep from "@/components/verification-step"

export default function SignUpScreen() {
    const { colors } = useTheme()
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
    const [isVerifying, setIsVerifying] = React.useState(false)

    const onEmailSubmit = async () => {
        if (!isLoaded) return
        try {
            await signUp.create({
                emailAddress
            })
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
            setPendingVerification(true)
            setStep(3) // Move to verification step
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2))
        }
    }

    const onPressVerify = async () => {
        if (!isLoaded) return
        setIsVerifying(true)
        try {
            const completeSignUp = await signUp.attemptEmailAddressVerification({
                code,
            })
            if (completeSignUp.status === 'complete') {
                setStep(4) // Move to the next step after email verification
            }
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2))
        } finally {
            setIsVerifying(false)
        }
    }

    const onSignUpPress = async () => {
        if (!isLoaded) return
        try {
            const completeSignUp = await signUp.update({
                firstName,
                lastName,
                password,
            })
            await setActive({ session: completeSignUp.createdSessionId })
            router.replace("/dashboard")
        } catch (err: any) {
            console.error(JSON.stringify(err, null, 2))
        }
    }

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <NameStep name={firstName} onNameChange={setFirstName} onContinue={() => setStep(2)}/>
                )
            case 2:
                return (
                    <EmailStep emailAddress={emailAddress} onEmailChange={setEmailAddress} onContinue={onEmailSubmit}/>
                )
            case 3:
                return (
                    <VerificationStep
                        code={code}
                        onCodeChange={setCode}
                        onVerify={onPressVerify}
                        isVerifying={isVerifying}
                    />
                )
            case 4:
                return (
                    <PhoneStep phoneNumber={phoneNumber} onPhoneChange={setPhoneNumber} onContinue={() => setStep(5)}/>
                )
            case 5:
                return (
                    <DateOfBirthStep
                        onContinue={() => setStep(6)}
                    />
                )
            case 6:
                return (
                    <PasswordStep password={password} onPasswordChange={setPassword} onContinue={onSignUpPress}/>
                )
        }
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1"
            style={{ backgroundColor: colors.background }}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}>
                {step > 1 && (
                    <TouchableOpacity
                        className="absolute top-20 left-5 z-10"
                        onPress={() => setStep(step - 1)}
                    >
                        <ChevronLeft size={24} color={colors.text} />
                    </TouchableOpacity>
                )}

                {renderStepContent()}

                {step !== 3 && (
                    <View className="flex-row justify-center mt-5 mb-10">
                        <Text style={{ color: colors.text }}>Déjà un compte ?</Text>
                        <Link href="/sign-in" asChild>
                            <TouchableOpacity>
                                <Text className="ml-1 font-bold" style={{ color: colors.primary }}>Se connecter</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

