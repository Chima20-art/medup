import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import { Link, router } from 'expo-router'
import { ChevronLeft } from "lucide-react-native";
import { useTheme } from "@react-navigation/native"

import PillIcon from '@/assets/images/pillIcon.svg'
import Medicine from '@/assets/images/medicine.svg'
import MedicationCard from "@/components/MedicationCard";

interface MedicationCard {
    id: string
    name: string
    dosage: string
    startDate: string
    endDate: string
    remainingPills: number
    renewalDate: string
    instructions: string
    duration: string
    isActive: boolean
}

const medications: MedicationCard[] = [
    {
        id: '1',
        name: 'DOLIPRANE',
        dosage: '30mg',
        startDate: 'x/x/x',
        endDate: 'x/x/x',
        remainingPills: 20,
        renewalDate: 'x/x/x',
        instructions: 'X fois / jour',
        duration: 'pendant 5 jours',
        isActive: true
    },
    {
        id: '2',
        name: 'DOLIPRANE',
        dosage: '30mg',
        startDate: 'x/x/x',
        endDate: 'x/x/x',
        remainingPills: 20,
        renewalDate: 'x/x/x',
        instructions: 'X fois / jour',
        duration: 'pendant 5 jours',
        isActive: false
    }
]


export default function ListMedicaments() {
    const [searchQuery, setSearchQuery] = useState('')
    const { colors } = useTheme()

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="pt-14 px-4 bg-white pb-6">
                <View className="flex-row items-center mb-6">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <ChevronLeft size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={{ fontFamily: 'Poppins_800ExtraBold' }} className="text-2xl text-primary-600">
                        Mes{'\n'}Medicaments
                    </Text>
                    <View className="absolute right-0">
                        <Medicine />
                    </View>
                </View>

                {/* Search Bar */}
                <View className="bg-primary-50 rounded-full flex-row items-center px-6">
                    <TextInput
                        placeholder="Rechercher un médicament..."
                        placeholderTextColor="#6B7280"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        className="flex-1 py-4"
                        style={{ fontFamily: 'Poppins_400Regular', fontSize: 16 }}
                    />
                </View>
            </View>

            {/* Medication List */}
            <ScrollView className="flex-1 px-4 pt-8">
                {medications.map(medication => (
                    <MedicationCard key={medication.id} medication={medication} />
                ))}
            </ScrollView>
        </View>
    )
}

