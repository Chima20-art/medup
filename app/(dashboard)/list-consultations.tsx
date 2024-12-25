import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import {router, useRouter} from 'expo-router'
import {Search, User2, Building2, ChevronLeft} from 'lucide-react-native'
import ConsultationCategory from "@/assets/images/consultationsCategory.svg"
import { LoadingSpinner } from '@/components/LoadingSpinner'
import Animated, { FadeIn } from 'react-native-reanimated'
import {supabase} from "@/utils/supabase";
import Medicine from "@/assets/images/medicine.svg";
import {useTheme} from "@react-navigation/native";

interface Consultation {
    id: number
    date: string
    doctorName: string
    adress: string
    city: string
    note: string
    speciality: number
}

export default function ListConsultations() {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState('')
    const [consultations, setConsultations] = useState<Consultation[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const { colors } = useTheme()


    const fetchConsultations = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from('consultations')
                .select('id, date, doctorName, adress, city, note, speciality')
                .order('date', { ascending: false })
                .ilike('doctorName', `%${searchQuery}%`); // Server-side filtering

            if (error) throw error;

            setConsultations(data || []);
        } catch (e) {
            console.error('Error fetching consultations:', e);
            setError(e instanceof Error ? e.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

// Trigger fetch when the search query changes
    useEffect(() => {
        fetchConsultations();
    }, [searchQuery]);

    const filteredConsultations = consultations.filter(consultation =>
        consultation.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        consultation.adress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        consultation.city.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const day = date.getDate()
        const month = date.toLocaleString('fr-FR', { month: 'short' }).toLowerCase()
        const year = date.getFullYear().toString().slice(2)
        return { day, month, year }
    }

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <LoadingSpinner />
            </View>
        )
    }

    if (error) {
        return (
            <View className="flex-1 justify-center items-center p-4">
                <Text className="text-red-500 text-center mb-4">{error}</Text>
            </View>
        )
    }

    if (consultations.length === 0) {
        return (
            <View className="flex-1 justify-center items-center p-4">
                <Text className="text-gray-500 text-center mb-4">Aucune consultation trouvée</Text>
            </View>
        )
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
                <View className="pt-14 px-4 bg-white pb-6">
                    <View className="flex-row items-center mb-6">
                        <TouchableOpacity onPress={() => router.back()} className="mr-4">
                            <ChevronLeft size={24} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={{ fontFamily: 'Poppins_800ExtraBold' }} className="text-2xl text-primary-600">
                            Mes consultations
                        </Text>
                        <View className="absolute right-0">
                            <ConsultationCategory />
                        </View>
                    </View>

                {/* Search Bar */}
                <View className="mt-4">
                    <View className="flex-row items-center bg-gray-100 rounded-xl px-4 h-12">
                        <Search size={20} className="opacity-50" />
                        <TextInput
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Rechercher une consultation..."
                            className="flex-1 ml-3 text-gray-900"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>
                </View>
            </View>

            {/* Consultations List */}
            <ScrollView className="flex-1 px-6">
                {filteredConsultations.map((consultation) => {
                    const { day, month, year } = formatDate(consultation.date)
                    return (
                        <Animated.View
                            key={consultation.id}
                            entering={FadeIn}
                            className="flex-col bg-white rounded-xl p-4 mt-4 shadow-sm"
                        >
                            <View className="flex-row items-center">
                                {/* Date Pill */}
                                <View className="bg-primary-500 rounded-full py-3 px-4 items-center mr-4">
                                    <Text className="text-white font-bold text-lg">{day}</Text>
                                    <Text className="text-white text-xs">{month}</Text>
                                    <Text className="text-white text-xs">{year}</Text>
                                </View>

                                {/* Content */}
                                <View className="flex-1">
                                    <Text className="text-lg font-semibold text-gray-900">
                                        {consultation.note || 'Consultation'}
                                    </Text>
                                    <View className="flex-row items-center mt-1">
                                        <Building2 size={16} className="opacity-50" />
                                        <Text className="ml-2 text-sm text-gray-600">
                                            {consultation.adress}, {consultation.city}
                                        </Text>
                                    </View>
                                    <View className="flex-row items-center mt-1">
                                        <User2 size={16} className="opacity-50" />
                                        <Text className="ml-2 text-sm text-gray-600">
                                            {consultation.doctorName}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Action Buttons */}
                            <View className="flex-row w-full justify-end items-end">
                                <TouchableOpacity
                                    onPress={() => router.push(`/consultation/${consultation.id}`)}
                                    className="bg-primary-500 rounded-full py-2 px-4"
                                >
                                    <Text className="text-white font-medium">Voir</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    )
                })}
            </ScrollView>
        </View>
    )
}

