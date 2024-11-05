import React from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { UserCircle2 } from 'lucide-react-native'

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
    return (
        <View className="flex-1 px-6">
            {/* Header */}
            <View className="h-16 flex-row items-center justify-center px-5">

                <View className="flex-row space-x-1">
                    {[1, 2, 3, 4, 5].map((step) => (
                        <View
                            key={step}
                            className={`h-1 w-5 rounded-full ${
                                step <= 1 ? 'bg-[#E91E63]' : 'bg-gray-200'
                            }`}
                        />
                    ))}
                </View>
            </View>

            {/* Title in French */}
            <Text className="text-2xl font-bold text-center mt-8 mb-2">
                Écrivez votre nom
            </Text>

            {/* Name Input */}
            <View className="flex-1">
                <TextInput
                    className="w-full h-12 border-b border-gray-300 px-2 text-center" // added text-center to center placeholder
                    value={name}
                    onChangeText={onNameChange}
                    placeholder="Entrez votre nom ou surnom" // placeholder in French
                    placeholderTextColor="#9CA3AF"
                />
            </View>

            {/* Continue Button in French */}
            <TouchableOpacity
                className="w-full h-14 bg-[#E91E63] rounded-full items-center justify-center mb-8"
                onPress={onContinue}
                disabled={!name.trim()}
            >
                <Text className="text-white text-lg font-semibold">
                    Continuer
                </Text>
            </TouchableOpacity>
        </View>

    )
}