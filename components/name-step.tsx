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
            <Text className="text-2xl font-bold text-center mt-8 mb-2">
                Write your name
            </Text>


            {/* Name Input */}
            <View className="flex-1">
                <TextInput
                    className="w-full h-12 border-b border-gray-300 px-2"
                    value={name}
                    onChangeText={onNameChange}
                    placeholder="Enter your name or nickname"
                    placeholderTextColor="#9CA3AF"
                />
            </View>

            {/* Continue Button */}
            <TouchableOpacity
                className="w-full h-14 bg-[#E91E63] rounded-full items-center justify-center mb-8"
                onPress={onContinue}
                disabled={!name.trim()}
            >
                <Text className="text-white text-lg font-semibold">
                    Continue
                </Text>
            </TouchableOpacity>
        </View>
    )
}