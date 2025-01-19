import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import { Link, router } from 'expo-router'
import {ChevronLeft, Search} from "lucide-react-native"
import { useTheme } from "@react-navigation/native"
import { supabase } from "@/utils/supabase"

import PillIcon from '@/assets/images/pillIcon.svg'
import Medicine from '@/assets/images/medicine.svg'
import MedicationCard from "@/components/MedicationCard"
import BioCategory from "@/assets/images/bioCategory.svg";


interface UploadedFile {
    uri: string;
    name: string;
}


interface Medication {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    dosage: string;
    stock: string;
    duration: string;
    frequency: string;
    notes: string;
    schedule: {
        matin: boolean;
        apres_midi: boolean;
        soir: boolean;
        nuit: boolean;
    };
    reminders: string[];
    file: UploadedFile | null;
    image: UploadedFile | null;
    momentDePrise: string;
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
            <View className="pt-4 px-4 bg-white ">
                {/*header*/}
                <View className="bg-white px-2 ">
                    <View className="flex-row items-center justify-between shadow-2xlo">
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
                                        Mes{'\n'}Medicaments
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
                            <Medicine  width={116} height={160}/>
                    </View>
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

