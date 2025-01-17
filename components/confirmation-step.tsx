import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Signup6 from "@/assets/images/signup-6.svg";
import Logo from "@/assets/images/logo.svg";
import {Home} from "lucide-react-native";

interface ConfirmationStepProps {
    onContinue: () => void;
}

export default function ConfirmationStep({ onContinue }: ConfirmationStepProps) {
    const { colors } = useTheme();

    return (
        <View className="flex-1 pt-16">

            <View style={{ marginHorizontal: 'auto' }}>
                <Logo width={250} height={150}/>
            </View>

            <View className="flex-1 px-2">
               <View className="bg-[#F7F7F7] p-6 pb-10 rounded-2xl my-4">
                   <Text className="text-3xl font-extrabold text-center text-gray-800">
                       Compte vérifié
                   </Text>

                   <Text className="text-center font-semibold mt-4 text-lg text-gray-400">
                       Votre compte a été créé avec succès.{"\n"} Appuyez sur continuer pour commencer à utiliser l'application.
                   </Text>
               </View>
                <View style={{ marginHorizontal: 'auto' }}>
                    <Signup6 width={200} height={200} />
                </View>

                <View className="flex-1 items-center justify-end pb-12">
                    <View className="relative">
                        <View
                            className="absolute inset-0 rounded-full"
                            style={{
                                backgroundColor: colors.primary,
                                opacity: 0.2,
                                transform: [{ scale: 1.2 }]
                            }}
                        />
                        <TouchableOpacity
                            className="w-20 h-20 rounded-full items-center justify-center"
                            style={{
                                backgroundColor: colors.primary,
                                shadowColor: colors.primary,
                                shadowOffset: {
                                    width: 0,
                                    height: 0,
                                },
                                shadowOpacity: 0.5,
                                shadowRadius: 10,
                                elevation: 8,
                            }}
                            onPress={onContinue}
                        >
                            <Home size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

            </View>
        </View>
    );
}

