import React, {useState} from "react";
import {
    View, Text, TextInput, TouchableOpacity, ActivityIndicator,
} from "react-native";
import {useTheme} from "@react-navigation/native";
import Signup3 from "@/assets/images/signup-3.svg";
import Logo from "@/assets/images/logo.svg";

interface VerificationStepProps {
    code: string;
    onCodeChange: (value: string) => void;
    onVerify: () => void;
    isVerifying: boolean;
    resendCode: () => void;
    verifingError: string;
    currentStep: number;
    totalSteps: number;
}

export default function VerificationStep({
                                             code,
                                             onCodeChange,
                                             onVerify,
                                             isVerifying,
                                             resendCode,
                                             verifingError,
                                             currentStep,
                                             totalSteps
                                         }: VerificationStepProps) {
    const {colors} = useTheme();
    const [error, setError] = useState<string | null>(null);
    const [isResending, setIsResending] = useState(false);

    const handleVerify = async () => {
        setError(null);
        try {
            onVerify();
        } catch (err: any) {
            if (err.errors?.[0]?.code === "verification_already_verified") {
                setError("This email has already been verified.");
            } else {
                setError(err.message || "An error occurred during verification.");
            }
        }
    };

    const handleResendCode = async () => {
        setIsResending(true);
        setError(null);
        try {
            await resendCode();
        } catch (err: any) {
            setError("Failed to resend code. Please try again.");
        } finally {
            setIsResending(false);
        }
    };

    return (<View className="flex-1 pt-16">
            <View className="mx-auto">
                <Logo/>
            </View>
            <View className="h-16 flex-row items-center justify-center px-5">
                <View className="flex flex-row gap-x-0.5">
                    {[1, 2, 3, 4, 5, 6].map((s) => (<View
                            key={s}
                            className={`h-1 w-10 rounded-full ${s <= 3 ? "bg-primary" : "bg-gray-200"}`}
                            style={{
                                backgroundColor: s <= 6 ? colors.primary : colors.border,
                            }}
                        />))}
                </View>
            </View>

            <Text
                className="text-2xl font-bold text-center mt-8 mb-2"
                style={{color: colors.text}}
            >
                Vérifier le compte
            </Text>

            <Text className="text-sm text-center mb-4" style={{color: colors.text}}>
                Cliquez sur le lien que nous vous avons envoyé à votre email pour
                vérifier votre compte
            </Text>


            {error && <Text className="text-red-500 text-center mb-2">{error}</Text>}

            <TouchableOpacity
                className="w-full h-14 rounded-full items-center justify-center mb-4"
                style={{backgroundColor: colors.primary}}
                onPress={handleVerify}
                disabled={isVerifying || code.length !== 6}
            >
                {isVerifying ? (<ActivityIndicator color={colors.card}/>) : (<Text
                        className="text-lg font-semibold"
                        style={{color: colors.card}}
                    >
                        Vérifier l'email
                    </Text>)}
            </TouchableOpacity>

            {verifingError && (<Text className="text-red-500 text-center my-2.5">{verifingError}</Text>)}

            <TouchableOpacity onPress={handleResendCode} disabled={isResending}>
                {isResending ? (<ActivityIndicator color={colors.primary}/>) : (
                    <Text className="text-center" style={{color: colors.primary}}>
                        Renvoyer le code
                    </Text>)}
            </TouchableOpacity>
        </View>);
}
