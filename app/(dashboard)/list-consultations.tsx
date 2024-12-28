import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native'
import { useRouter } from 'expo-router'
import { Search, User2, Building2, ChevronLeft, Plus } from 'lucide-react-native'
import ConsultationCategory from "@/assets/images/consultationsCategory.svg"
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { supabase } from "@/utils/supabase"

interface Consultation {
    id: number;
    doctorName: string;
    speciality: number;
    date: string;
    adress: string;
    city: string;
    note: string | null;
    reminder: boolean;
    nextAppointment: string | null;
    uploads: string[] | null;
    audio_notes: string[] | null;
    created_at: string;
    user_id: string;
    specialties: {
        name: string;
        hexColor: string;
    };
}

export default function ListConsultations() {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState('')
    const [consultations, setConsultations] = useState<Consultation[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchConsultations = async () => {
        try {
            setIsLoading(true)
            setError(null)

            const { data, error } = await supabase
                .from('consultations')
                .select('*, specialties(name, hexColor)')
                .order('date', { ascending: false })
                .ilike('doctorName', `%${searchQuery}%`)

            if (error) throw error

            setConsultations(data || [])
        } catch (e) {
            console.error('Error fetching consultations:', e)
            setError(e instanceof Error ? e.message : 'An error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchConsultations()
    }, [searchQuery])

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return {
            day: date.getDate(),
            month: date.toLocaleString('default', { month: 'short' }),
            year: date.getFullYear().toString().slice(2),
        }
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

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white px-2 pb-4">
                <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-1 mr-2">
                        <View className="flex-row items-start">
                            <TouchableOpacity
                                onPress={() => router.back()}
                                className="w-10 h-10 items-center justify-center rounded-full"
                            >
                                <ChevronLeft size={24} color="#4F46E5" />
                            </TouchableOpacity>
                            <View className="flex-col items-center mr-2">
                                <Text className="text-primary-500 text-3xl font-bold">
                                    Mes
                                </Text>
                                <Text className="text-primary-500 text-3xl font-bold ml-1">
                                    consultations
                                </Text>
                            </View>
                        </View>
                    </View>
                    <ConsultationCategory className="" />
                </View>

                {/* Search Bar */}
                <View className="flex-row items-center bg-gray-100 rounded-xl px-4 h-12 mt-2">
                    <Search size={20} color="#9CA3AF" />
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Recherche"
                        className="flex-1 ml-3 text-base"
                        placeholderTextColor="#9CA3AF"
                    />
                </View>
            </View>

            {/* Consultations List */}
            <ScrollView className="flex-1 px-4 pt-4">
                {consultations.map((consultation) => {
                    const date = formatDate(consultation.date)
                    return (
                        <TouchableOpacity
                            key={consultation.id}
                            onPress={() => router.push(`/consultation/${consultation.id}`)}
                            className="mb-4 flex-row items-stretch px-2"
                        >
                            <View className="bg-primary-500 w-16 py-4 items-center justify-center rounded-full my-2 mr-2">
                                <Text className="text-white text-2xl font-bold">
                                    {date.day}
                                </Text>
                                <Text className="text-white uppercase">{date.month}</Text>
                                <Text className="text-white">{date.year}</Text>
                            </View>
                            <View className="flex-1 bg-white rounded-3xl p-4 shadow-sm">
                                <View className="flex-row justify-between items-start mb-2">
                                    <Text className="text-gray-900 font-medium">
                                        {consultation.note || 'Consultation'}
                                    </Text>
                                    <View
                                        style={{ backgroundColor: consultation.specialties.hexColor }}
                                        className="px-2 py-1 rounded-full"
                                    >
                                        <Text className="text-white text-xs">
                                            {consultation.specialties.name}
                                        </Text>
                                    </View>
                                </View>

                                {/* Doctor Info */}
                                <View className="flex-row items-center mb-2">
                                    <User2 size={16} color="#4B5563" />
                                    <Text className="text-sm text-gray-600 ml-2">
                                        {consultation.doctorName}
                                    </Text>
                                </View>

                                {/* Address Info */}
                                <View className="flex-row items-center mb-3">
                                    <Building2 size={16} color="#4B5563" />
                                    <Text className="text-sm text-gray-600 ml-2">
                                        {consultation.adress}, {consultation.city}
                                    </Text>
                                </View>

                                {/* Action Buttons */}
                                <View className="flex-row gap-x-2 justify-end">
                                    <TouchableOpacity
                                        className="bg-primary px-4 py-2 rounded-xl"
                                        onPress={() => router.push(`/consultation/${consultation.id}`)}
                                    >
                                        <Text className="text-white text-sm font-medium">
                                            Détail
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )
                })}
            </ScrollView>


        </SafeAreaView>
    )
}

