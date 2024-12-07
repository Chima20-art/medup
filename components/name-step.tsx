import React from 'react'
import {View, Text, TextInput, TouchableOpacity, Image} from 'react-native'
import { UserCircle2 } from 'lucide-react-native'
import { useTheme } from '@react-navigation/native'
import Signup1 from '@/assets/images/signup-1.svg'
import WelcomeIllustration from "@/assets/images/welcome-illustration.svg";

interface NameStepProps {
    name: string
    onNameChange: (value: string) => void
    onContinue: () => void
}

export default function NameStep({
                                     name,
                                     onNameChange,
                                     onContinue
                                 }: NameStepProps) {
    const { colors } = useTheme()

    return (
        <View className="flex-1 pt-16">
            <View style={{ marginHorizontal: 'auto' }}> {/* Adjust spacing here */}
               <Signup1
                   width={250} height={250}
               />
           </View>


            <View className="h-16 flex-row items-center justify-center px-5">
                <View className="flex flex-row gap-x-0.5">
                    {[1, 2, 3, 4, 5, 6].map((step) => (
                        <View
                            key={step}
                            className={`h-1 w-10 rounded-full`}
                            style={{
                                backgroundColor: step <= 1 ? colors.primary : colors.border
                            }}
                        />
                    ))}
                </View>
            </View>

            <Text className="text-2xl font-bold text-center mt-8 mb-2" style={{ color: colors.text }}>
                Écrivez votre nom d'utilisateur
            </Text>

            <View className="flex-1">
                <TextInput
                    className="w-full h-12 border-b px-2 text-center text-lg"
                    style={{ borderBottomColor: colors.border, color: colors.text }}
                    value={name}
                    onChangeText={onNameChange}
                    placeholder="Entrez votre nom ou surnom"
                    placeholderTextColor={colors.text}
                />
            </View>

            <TouchableOpacity
                className="w-full h-14 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: name.trim() ? colors.primary : colors.border }}
                onPress={onContinue}
                disabled={!name.trim()}
            >
                <Text className="text-lg font-semibold" style={{ color: colors.background }}>
                    Continuer
                </Text>
            </TouchableOpacity>
        </View>
    )
}