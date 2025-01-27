import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import {ArrowLeft, ChevronLeft} from 'lucide-react-native';

import RadioCategory from "@/assets/images/radioCategory.svg";
import BioCategory from "@/assets/images/bioCategory.svg";
import MedicationCategory from "@/assets/images/medicationCategory.svg";
import ConsultationCategory from "@/assets/images/consultationsCategory.svg";
import QuickAccess from "@/assets/images/QuickAcess.svg";
import {useTheme} from "@react-navigation/native";

export default function Add() {
    const router = useRouter();
    const { colors } = useTheme();
    const categories = [
        {
            title: "Examen \nradiologique",
            image: RadioCategory,
            route: '/add-examin-radiologique'
        },
        {
            title: " Examen\nBiologique",
            image: BioCategory,
            route: '/add-examin-biologique'
        },
        {
            title: "\nMedicament",
            image: MedicationCategory,
            route: '/add-medicament'
        },
        {
            title: "\nConsultation",
            image: ConsultationCategory,
            route: "/add-consultation",
        },
        {
            title: "Accès\nrapide",
            image: QuickAccess,
            route: '/acces-rapide'
        },
    ] as const;

    return (
        <View className="flex-1 pt-4 bg-gray-50">
            {/* Header Section */}
            <View className="flex-row px-6 pt-14 pb-6 bg-white">
                <TouchableOpacity onPress={() => router.back()}
                                  className="w-10 h-10 items-center justify-center rounded-full bg-gray-100 mr-1"
                >
                    <ChevronLeft size={34} color={colors.primary} />
                </TouchableOpacity>
                <Text className="text-primary-500 text-3xl font-extrabold">
                    Que souhaitez-vous ajouter ?
                </Text>
            </View>

            <ScrollView className="flex-1 px-6 pt-6">

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
                            <category.image
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