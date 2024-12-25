import React, {useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, ScrollView, Image} from 'react-native';
import {useRouter} from 'expo-router';
import {Search, Calendar, User2, Building2, ChevronRight} from 'lucide-react-native';
import ConsultationCategory from "@/assets/images/consultationsCategory.svg"

// Sample data - replace with your actual data
const consultations = [{
    id: 1,
    date: '2024-07-30',
    title: 'Consultation générale',
    doctor: 'DR. Benjelloune',
    location: 'Cabinet Medical Central',
    status: 'completed'
}, {
    id: 2,
    date: '2024-07-25',
    title: 'Suivi trimestriel',
    doctor: 'DR. Benjelloune',
    location: 'Cabinet Medical Central',
    status: 'scheduled'
}, {
    id: 3,
    date: '2024-07-20',
    title: 'Consultation spécialisée',
    doctor: 'DR. Benjelloune',
    location: 'Cabinet Medical Central',
    status: 'pending'
},];

export default function ListConsultations() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredConsultations = consultations.filter(consultation => consultation.title.toLowerCase().includes(searchQuery.toLowerCase()) || consultation.doctor.toLowerCase().includes(searchQuery.toLowerCase()) || consultation.location.toLowerCase().includes(searchQuery.toLowerCase()));

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleString('fr-FR', {month: 'short'}).toLowerCase();
        const year = date.getFullYear().toString().slice(2);
        return {day, month, year};
    };

    return (<View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white px-6 pt-14 pb-6">
                <View className="flex-row items-center justify-between">
                    <View>
                        <Text className="text-2xl font-bold text-gray-900">
                            Mes consultations
                        </Text>
                    </View>
                    <ConsultationCategory/>
                </View>

                {/* Search Bar */}
                <View className="mt-4">
                    <View className="flex-row items-center bg-gray-100 rounded-xl px-4 h-12">
                        <Search size={20} className=" bg-grey-50 opacity-50"/>
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
                    const {day, month, year} = formatDate(consultation.date);
                    return (<View key={consultation.id}
                                  className="flex-col bg-white rounded-xl p-4 mt-4 shadow-sm">
                            <View
                                className="flex-row items-center"
                            >
                                {/* Date Pill */}
                                <View className="bg-primary-500 rounded-full py-3 px-4 items-center mr-4">
                                    <Text className="text-white font-bold text-lg">{day}</Text>
                                    <Text className="text-white text-xs">{month}</Text>
                                    <Text className="text-white text-xs">{year}</Text>
                                </View>

                                {/* Content */}
                                <View className="flex-1">
                                    <Text className="text-lg font-semibold text-gray-900">
                                        {consultation.title}
                                    </Text>
                                    <View className="flex-row items-center mt-1">
                                        <Building2 size={16} className="opacity-50"/>
                                        <Text className="ml-2 text-sm text-gray-600">
                                            {consultation.location}
                                        </Text>
                                    </View>
                                    <View className="flex-row items-center mt-1">
                                        <User2 size={16} className="opacity-50"/>
                                        <Text className="ml-2 text-sm text-gray-600">
                                            {consultation.doctor}
                                        </Text>
                                    </View>
                                </View>

                            </View>
                            {/* Action Buttons */}
                            <View className="flex-row w-full justify-end items-end">
                                <TouchableOpacity
                                    // onPress={() => router.push(`/consultation/${consultation.id}`)}
                                    className="bg-primary-500 rounded-full py-2 px-4"
                                >
                                    <Text className="text-white font-medium">Voir</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                    )
                })}
            </ScrollView>

        </View>);
}