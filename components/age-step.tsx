import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';

export default function DateOfBirthStep({ selectedAge, onAgeChange, onContinue }: any) {
    const ages = Array.from({ length: 100 }, (_, i) => i + 1);

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="h-16 flex-row items-center justify-center px-5">
                <TouchableOpacity
                    className="absolute left-4 top-5"
                    onPress={() => {/* Handle back */}}
                >
                    <ChevronLeft size={24} color="#E91E63" />
                </TouchableOpacity>
                <View className="flex-row space-x-1">
                    {[1, 2, 3, 4].map((step) => (
                        <View
                            key={step}
                            className={`h-1 w-5 rounded-full ${
                                step <= 2 ? 'bg-[#E91E63]' : 'bg-gray-200'
                            }`}
                        />
                    ))}
                </View>
            </View>

            {/* Content */}
            <View className="flex-1 px-6">
                <Text className="text-3xl font-bold text-center mt-6 mb-4">
                    Quel âge avez-vous ?
                </Text>
                <Text className="text-gray-600 text-center text-base leading-relaxed mb-8 px-4">
                    Connaître votre âge nous permet de suivre votre santé plus précisément, car les valeurs de référence pour les analyses en dépendent
                </Text>

                {/* Age Picker */}
                <View className="flex-1 items-center justify-center">
                    <View className="h-[300px]">
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            className="px-4"
                            contentContainerStyle={{
                                paddingVertical: 120
                            }}
                        >
                            {ages.map((age) => (
                                <TouchableOpacity
                                    key={age}
                                    onPress={() => onAgeChange(age)}
                                    className={`h-12 justify-center items-center ${
                                        selectedAge === age
                                            ? 'bg-gray-50'
                                            : 'bg-transparent'
                                    }`}
                                >
                                    <Text
                                        className={`${
                                            selectedAge === age
                                                ? 'text-2xl font-bold text-black'
                                                : 'text-lg text-gray-400'
                                        }`}
                                    >
                                        {age}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>

                {/* Continue Button */}
                <TouchableOpacity
                    className="w-full h-14 bg-[#E91E63] rounded-full items-center justify-center mb-8"
                    onPress={onContinue}
                >
                    <Text className="text-white text-lg font-semibold">
                        Continuer
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
