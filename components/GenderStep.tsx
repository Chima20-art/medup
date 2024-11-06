import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useTheme } from '@react-navigation/native'
import { ChevronLeft } from 'lucide-react-native'

interface GenderStepProps {
    selectedGender: string | null
    onGenderChange: (gender: string) => void
    onClose: () => void
    onSkip: () => void
    onNext: () => void
}

export default function GenderStep({
                                       selectedGender,
                                       onGenderChange,
                                       onClose,
                                       onSkip,
                                       onNext
                                   }: GenderStepProps) {
    const { colors } = useTheme()

    return (
        <View className="flex-1 bg-red-300 p-6">
            <TouchableOpacity
                onPress={onClose}
                className="absolute left-4 top-4"
            >
                <ChevronLeft size={24} color={colors.text} />
            </TouchableOpacity>

            <View className="mt-12">
                <Text className="text-2xl font-bold text-center" style={{ color: colors.text }}>
                    Specify your sex
                </Text>
                <Text className="text-center mt-2 text-base px-6" style={{ color: colors.text }}>
                    Knowing your age and sex allows us to track your health more accurately, as the reference ranges for lab values depend on them
                </Text>
            </View>

            <View className="flex-1 justify-center space-y-4 px-4">
                <TouchableOpacity
                    onPress={() => onGenderChange('female')}
                    className="flex-row items-center p-4 rounded-xl border"
                    style={{
                        backgroundColor: selectedGender === 'female' ? colors.card : 'transparent',
                        borderColor: selectedGender === 'female' ? colors.primary : colors.border,
                    }}
                >
                    <View
                        className="w-8 h-8 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: colors.primary }}
                    >
                        <Text className="text-xl" style={{ color: colors.card }}>♀</Text>
                    </View>
                    <Text className="text-lg font-medium" style={{ color: colors.text }}>
                        Female
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => onGenderChange('male')}
                    className="flex-row items-center p-4 rounded-xl border"
                    style={{
                        backgroundColor: selectedGender === 'male' ? colors.card : 'transparent',
                        borderColor: selectedGender === 'male' ? colors.primary : colors.border,
                    }}
                >
                    <View
                        className="w-8 h-8 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: colors.primary }}
                    >
                        <Text className="text-xl" style={{ color: colors.card }}>♂</Text>
                    </View>
                    <Text className="text-lg font-medium" style={{ color: colors.text }}>
                        Male
                    </Text>
                </TouchableOpacity>
            </View>

            <View className="flex-row justify-between mt-6 px-4">
                <TouchableOpacity
                    onPress={onSkip}
                    className="px-6 py-3 rounded-full"
                    style={{ backgroundColor: colors.card }}
                >
                    <Text style={{ color: colors.primary }}>Skip</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={onNext}
                    className="px-6 py-3 rounded-full"
                    style={{
                        backgroundColor: selectedGender ? colors.primary : colors.border,
                        opacity: selectedGender ? 1 : 0.5
                    }}
                    disabled={!selectedGender}
                >
                    <Text style={{ color: colors.card }}>Next</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}