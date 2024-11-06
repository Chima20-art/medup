import React from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { useTheme } from '@react-navigation/native'

export default function DateOfBirthStep({ selectedAge, onAgeChange, onContinue }: any) {
    const { colors } = useTheme()
    const ages = Array.from({ length: 100 }, (_, i) => i + 1)

    return (
        <View className="flex-1">
            <View className="h-16 flex-row items-center justify-center px-5">
                <View className="flex flex-row gap-x-0.5">
                    {[1, 2, 3, 4, 5, 6].map((step) => (
                        <View
                            key={step}
                            className={`h-1 w-10 rounded-full`}
                            style={{
                                backgroundColor: step <= 2 ? colors.primary : colors.border
                            }}
                        />
                    ))}
                </View>
            </View>

            <View className="flex-1 px-6">
                <Text className="text-3xl font-bold text-center mt-6 mb-4" style={{ color: colors.text }}>
                    Quel âge avez-vous ?
                </Text>
                <Text className="text-center text-base leading-relaxed mb-8 px-4" style={{ color: colors.text }}>
                    Connaître votre âge nous permet de suivre votre santé plus précisément, car les valeurs de référence pour les analyses en dépendent
                </Text>

                <View className="flex-1 items-center justify-center">
                    <View className="h-[300px]">
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            className="px-4"
                            contentContainerStyle={{
                                paddingVertical: 12
                            }}
                        >
                            {ages.map((age) => (
                                <TouchableOpacity
                                    key={age}
                                    onPress={() => onAgeChange(age)}
                                    className={`h-12 justify-center items-center`}
                                    style={{
                                        backgroundColor: selectedAge === age ? colors.card : 'transparent'
                                    }}
                                >
                                    <Text
                                        className={`${
                                            selectedAge === age
                                                ? 'text-2xl font-bold'
                                                : 'text-lg'
                                        }`}
                                        style={{
                                            color: selectedAge === age ? colors.text : colors.border
                                        }}
                                    >
                                        {age}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>

                <TouchableOpacity
                    className="w-full h-14 rounded-full items-center justify-center mb-4"
                    style={{ backgroundColor: colors.primary }}
                    onPress={onContinue}
                >
                    <Text className="text-lg font-semibold" style={{ color: colors.background }}>
                        Continuer
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}