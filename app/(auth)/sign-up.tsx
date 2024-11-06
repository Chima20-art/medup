import * as React from 'react'
import {
    Text,
    TextInput,
    TouchableOpacity,
    View,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Dimensions,
    Image
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
                    <View className="h-16 flex-row items-center justify-center px-5">
                        <View className="flex flex-row gap-x-0.5">
                            {[1, 2, 3, 4, 5, 6].map((s) => (
                                <View
                                    key={s}
                                    className={`h-1 w-10 rounded-full ${
                                        s <= 6 ? 'bg-primary' : 'bg-gray-200'
                                    }`}
                                    style={{ backgroundColor: s <= 6 ? colors.primary : colors.border }}
                                />
                            ))}
                        </View>
                    </View>

                    <Text className="text-2xl font-bold text-center mt-8 mb-2" style={{ color: colors.text }}>
                        Code de vérification
                    </Text>

                    <View className="flex-1">
                        <TextInput
                            className="w-full h-12 border-b px-2 text-center"
                            style={{ borderBottomColor: colors.border, color: colors.text }}
                            value={code}
                            onChangeText={setCode}
                            placeholder="Code de vérification"
                            placeholderTextColor={colors.text}
                            keyboardType="number-pad"
                            maxLength={6}
                        />
                    </View>

                    <TouchableOpacity
                        className="w-full h-14 rounded-full items-center justify-center"
                        style={{ backgroundColor: colors.primary }}
                        onPress={onPressVerify}
                        disabled={isVerifying}
                    >
                        <Text className="text-lg font-semibold" style={{ color: colors.card }}>
                            {isVerifying ? "Vérification..." : "Vérifier l'email"}
                        </Text>
                    </TouchableOpacity>
                </View>
            )
        }

        switch (step) {
            case 1:
                return (
                    <NameStep name={firstName} onNameChange={setFirstName} onContinue={() => setStep(2)}/>
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
                    <PasswordStep password={password} onPasswordChange={setPassword} onContinue={() => onSignUpPress()}/>
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
                {(step > 1 || pendingVerification) && (
                    <TouchableOpacity
                        className="absolute top-20 left-5 z-10"
                        onPress={() => {
                            if (pendingVerification) {
                                setPendingVerification(false)
                                setStep(5) // Go back to password step
                            } else {
                                setStep(step - 1)
                            }
                        }}
                    >
                        <ChevronLeft size={24} color={colors.text} />
                    </TouchableOpacity>
                )}
                <Image
                    source={require('@/assets/images/Logo.png')}
                    className="h-32 mt-16 mx-auto"
                    resizeMode="contain"
                />

                {renderStepContent()}
                {!pendingVerification && (
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