import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Signup6 from "@/assets/images/signup-6.svg";
import {Home} from "lucide-react-native";

interface ConfirmationStepProps {
    onContinue: () => void;
}

export default function ConfirmationStep({ onContinue }: ConfirmationStepProps) {
    const { colors } = useTheme();

    return (
        <View className="flex-1 pt-16">
            <View style={{ marginHorizontal: 'auto' }}>
                <Signup6 width={250} height={250} />
            </View>

            <View className="h-16 flex-row items-center justify-center px-5">
                <View className="flex flex-row gap-x-0.5">
                    {[1, 2, 3, 4, 5, 6, 7].map((step) => (
                        <View
                            key={step}
                            className={`h-1 w-10 rounded-full`}
                            style={{
                                backgroundColor: step <= 7 ? colors.primary : colors.border,
                            }}
                        />
                    ))}
                </View>
            </View>

            <View className="flex-1 px-2">
                <Text className="text-2xl font-bold text-center mt-6" style={{ color: colors.text }}>
                    Compte vérifié
                </Text>

                <Text className="text-center mt-4 text-base" style={{ color: colors.text }}>
                    Votre compte a été créé avec succès. Appuyez sur continuer pour commencer à utiliser l'application.
                </Text>

                    <View className="flex-1 items-center justify-end pb-4">
                        <TouchableOpacity
                            className="w-16 h-16 rounded-full items-center justify-center"
                            style={{ backgroundColor: colors.primary }}
                            onPress={onContinue}
                        >
                            <Home size={24} color="white" />
                        </TouchableOpacity>
                    </View>
            </View>
        </View>
    );
}

