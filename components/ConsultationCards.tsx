import React, { memo, useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { User2, Building2 } from 'lucide-react-native';
import { supabase } from "@/utils/supabase";
import { LoadingSpinner } from '@/components/LoadingSpinner';
import Doctor from "@/assets/images/doctor.svg";


interface Consultation {
    id: number;
    doctorName: string;
    speciality: number;
    date: string;
    adress: string;
    city: string;
    note: string | null;
    reminder: boolean;
    nextConsultationDate: string | null;
    nextConsultationDateReminder: string | null;
    uploads: string[] | null;
    audio_notes: string[] | null;
    created_at: string;
    user_id: string;
    specialties: {
        name: string;
        hexColor: string;
    };
}

interface ConsultationCardsProps {
    searchQuery: string;
    onConsultationPress: (consultation: Consultation) => void;
}

const ConsultationCards = memo(({ searchQuery, onConsultationPress }: ConsultationCardsProps) => {
    const [consultations, setConsultations] = useState<Consultation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const formatToFrenchDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0'); // Ensures two digits for the day
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Ensures two digits for the month
        const year = date.getFullYear(); // Four-digit year
        return `${day}/${month}/${year}`;
    };

    const fetchConsultations = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from('consultations')
                .select('*, specialties(name, hexColor)')
                .order('date', { ascending: false })
                .ilike('doctorName', `%${searchQuery}%`);

            if (error) throw error;

            setConsultations(data || []);
        } catch (e) {
            console.error('Error fetching consultations:', e);
            setError(e instanceof Error ? e.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery]);

    useEffect(() => {
        fetchConsultations();
    }, [fetchConsultations]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return {
            day: date.getDate(),
            month: date.toLocaleString('default', { month: 'short' }),
            year: date.getFullYear().toString().slice(2),
        };
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <LoadingSpinner />
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 justify-center items-center p-4">
                <Text className="text-red-500 text-center mb-4">{error}</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 px-4 bg-gray-50 pt-4">
            {consultations.map((consultation) => {
                const date = formatDate(consultation.date);
                return (
                    <TouchableOpacity
                        key={consultation.id}
                        onPress={() => onConsultationPress(consultation)}
                        className="mb-4 flex-row items-stretch px-2"
                    >
                        <View className="flex-1 bg-white rounded-3xl p-4 shadow-sm">
                            <View className="flex-row gap-x-2">
                                <View
                                    className="bg-gray-200 rounded-full h-16 w-16 justify-center items-center">
                                    <Doctor width={36} height={36}/>
                                </View>
                                <View className="flex-1 flex-col gap-y-1 mt-1">
                                    <Text className="text-gray-900 font-medium capitalize">
                                        {consultation.doctorName}
                                    </Text>
                                    <View className="flex-row">
                                        {/*speciality*/}
                                        <View
                                            style={{backgroundColor: consultation.specialties.hexColor}}
                                            className="px-3 py-1 rounded-full"
                                        >
                                            <Text className="text-white text-xs">
                                                {consultation.specialties.name}
                                            </Text>
                                        </View>
                                        {/*adress*/}
                                        <Text className="text-sm text-gray-600 ml-2">
                                            | {consultation.adress}
                                        </Text>
                                    </View>
                                    {/*date consultation*/}
                                    <View className="flex-row items-center mb-2 mt-4">
                                        <Text className="text-sm text-gray-600 ml-2">
                                            {formatToFrenchDate(consultation.date)}
                                        </Text>
                                    </View>

                                    {/*date next consultation*/}
                                    {consultation.nextConsultationDate &&
                                        <View className="flex-row items-start mb-3">
                                            <Text className="text-sm text-gray-600 ml-2">
                                                Prochaine consultation programée le {formatToFrenchDate(consultation.nextConsultationDate)}
                                            </Text>
                                        </View>
                                    }

                                </View>
                            </View>



                            <View className="flex-row gap-x-2 justify-end">
                                <TouchableOpacity
                                    className="px-4 py-2 bg-primary-500 rounded-xl"
                                    onPress={() => onConsultationPress(consultation)}
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
                );
            })}
        </ScrollView>
    );
});

export default ConsultationCards;

