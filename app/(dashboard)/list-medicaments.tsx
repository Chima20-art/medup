import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import { Link, router } from 'expo-router'
import { ChevronLeft } from "lucide-react-native"
import { useTheme } from "@react-navigation/native"
import { supabase } from "@/utils/supabase"

import PillIcon from '@/assets/images/pillIcon.svg'
import Medicine from '@/assets/images/medicine.svg'
import MedicationCard from "@/components/MedicationCard"

interface Medication {
    id: string
    name: string
    dosage: string
    startDate: string
    endDate: string
    stock: string
    momentDePrise: string
    notes: string
    schedule: any
    isActive?: boolean
}

export default function ListMedicaments() {
    const [searchQuery, setSearchQuery] = useState('')
    const [medications, setMedications] = useState<Medication[]>([])
    const { colors } = useTheme()

    useEffect(() => {
        const fetchMedications = async () => {
            const { data, error } = await supabase
                .from("medicaments")
                .select("*")

            if (error) {
                console.error("Error fetching medications:", error)
                return
            }

            if (data) {
                // Transform the data to match your component's needs
                const transformedData = data.map(med => ({
                    ...med,
                    isActive: new Date(med.endDate) > new Date() // Check if medication is still active
                }))
                setMedications(transformedData)
            }
        }

        fetchMedications()

        // Set up real-time subscription
        const subscription = supabase
            .channel("medicaments_changes")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "medicaments",
                },
                async (payload) => {
                    const { data } = await supabase.from("medicaments").select("*")
                    if (data) {
                        const transformedData = data.map(med => ({
                            ...med,
                            isActive: new Date(med.endDate) > new Date()
                        }))
                        setMedications(transformedData)
                    }
                }
            )
            .subscribe()

        // Cleanup subscription
        return () => {
            subscription.unsubscribe()
        }
    }, [])

    // Filter medications based on search query
    const filteredMedications = medications.filter(med =>
        med.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

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
                {filteredMedications.map(medication => (
                    <TouchableOpacity key={medication.id}
                                      onPress={() => router.push(`/medicament/${medication.id}`)}
                    >
                        <MedicationCard medication={medication} />
                    </TouchableOpacity>


                ))}
            </ScrollView>
        </View>
    )
}

