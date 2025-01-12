import React, { useState, useEffect, useRef } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Animated } from 'react-native'
import { useRouter } from 'expo-router'
import { Search, User2, Building2, ChevronLeft } from 'lucide-react-native'
import ConsultationCategory from "@/assets/images/consultationsCategory.svg"
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { supabase } from "@/utils/supabase"
import ConsultationDetailPopup from '@/components/ConsultationDetailPopup'

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
    const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null)
    const slideAnim = useRef(new Animated.Value(0)).current

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

        const subscription = supabase
            .channel('consultations_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'consultations',
                },
                () => {
                    fetchConsultations()
                }
            )
            .subscribe()

        return () => {
            subscription.unsubscribe()
        }
    }, [searchQuery])

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return {
            day: date.getDate(),
            month: date.toLocaleString('default', { month: 'short' }),
            year: date.getFullYear().toString().slice(2),
        }
    }

    const handleConsultationPress = async (consultation: Consultation) => {
        setSelectedConsultation(consultation)
        await new Promise(resolve => setTimeout(resolve, 100))
        Animated.spring(slideAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
        }).start()
    }

    const handleClosePopup = () => {
        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
        }).start(() => setSelectedConsultation(null))
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
        <SafeAreaView className="flex-1 pt-4">
            {/* Header */}
            <View className="bg-white px-2 pb-4">
                <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-col flex-1 mr-2">
                        <View className="flex-row items-start gap-x-2">
                            <TouchableOpacity
                                onPress={() => router.back()}
                                className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
                            >
                                <ChevronLeft size={24} color="#4F46E5" />
                            </TouchableOpacity>
                            <View className="flex-col items-start mr-2 flex-1">
                                <Text className="text-primary-500 text-3xl font-extrabold">
                                    Mes
                                </Text>
                                <Text className="text-primary-500 text-3xl font-extrabold ml-1">
                                    consultations
                                </Text>
                            </View>
                        </View>
                        {/* Search Bar */}
                        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 h-12 m-2 mt-4 ml-4">
                            <Search size={26} color="#9CA3AF" />
                            <TextInput
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholder="Recherche"
                                className="flex-1 ml-3 text-lg"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                    </View>
                    <ConsultationCategory />
                </View>
            </View>

            {/* Consultations List */}
            <ScrollView className="flex-1 px-4 bg-gray-50 pt-4">
                {consultations.map((consultation) => {
                    const date = formatDate(consultation.date)
                    return (
                        <TouchableOpacity
                            key={consultation.id}
                            onPress={() => handleConsultationPress(consultation)}
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
                                        className="px-4 py-2 bg-primary-500 rounded-xl"
                                        onPress={() => handleConsultationPress(consultation)}
                                    >
                                        <Text className="text-xs font-medium text-secondary">
                                            {consultation?.uploads?.length
                                                ? `${consultation.uploads.length} fichier(s)`
                                                : "Aucun fichier"}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )
                })}
            </ScrollView>

            {selectedConsultation && slideAnim ? (
                <ConsultationDetailPopup
                    consultation={selectedConsultation}
                    slideAnim={slideAnim}
                    onClose={handleClosePopup}
                />
            ) : null}
        </SafeAreaView>
    )
}

