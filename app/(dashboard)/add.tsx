import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

export default function Add() {
    const router = useRouter();

    const categories = [
        {
            title: 'Examens\nRadiologiques',
            image: '/placeholder.svg?height=80&width=80',
            route: '/add-examin-radiologique'
        },
        {
            title: 'Examens\nBiologiques',
            image: '/placeholder.svg?height=80&width=80',
            route: '/add-examin-biologique'
        },
        {
            title: 'Médicaments',
            image: '/placeholder.svg?height=80&width=80',
            route: '/add-medicament'
        },
        {
            title: 'Consultations',
            image: '/placeholder.svg?height=80&width=80',
            route: '/add-consultation'
        },
    ];

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header Section */}
            <View className="px-6 pt-14 pb-6 bg-white">
                <TouchableOpacity onPress={() => router.back()} className="mb-4">
                    <ArrowLeft size={24} color="#000" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6 pt-6">
                <Text className="text-lg font-semibold text-gray-900 mb-4">
                    Que souhaitez-vous ajouter ?
                </Text>
                <View className="flex-row flex-wrap justify-between">
                    {categories.map((category, index) => (
                        <TouchableOpacity
                            key={index}
                            className="w-[48%] aspect-square bg-white rounded-3xl p-4 mb-4 items-center justify-between"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.05,
                                shadowRadius: 8,
                                elevation: 2
                            }}
                            onPress={() => router.push(category.route as any)}
                        >
                            <Image
                                source={{ uri: category.image }}
                                className="w-16 h-16"
                            />
                            <Text className="text-center text-gray-900 text-base font-medium">
                                {category.title}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}