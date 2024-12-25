import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from "@react-navigation/native";
import { ChevronLeft, Edit2, Trash2, Save, Hash, Palette } from 'lucide-react-native';
import { supabase } from "@/utils/supabase";
import { Specialty } from '@/types/specialty';

interface SpecialtyDetailsProps {
    specialty: Specialty;
}

export default function SpecialtyDetails({ specialty: initialSpecialty }: SpecialtyDetailsProps) {
    const router = useRouter();
    const { colors } = useTheme();
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [specialty, setSpecialty] = useState(initialSpecialty);

    const handleUpdate = async () => {
        setIsLoading(true);
        try {
            const { error } = await supabase
                .from("specialties")
                .update({
                    name: specialty.name,
                    hexColor: specialty.hexColor,
                })
                .eq("id", specialty.id);

            if (error) throw error;

            Alert.alert("Success", "Specialty updated successfully");
            setIsEditing(false);
        } catch (error) {
            console.error("Error:", error);
            Alert.alert("Error", "Failed to update specialty");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        Alert.alert(
            "Confirm Deletion",
            "Are you sure you want to delete this specialty?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        setIsLoading(true);
                        try {
                            const { error } = await supabase
                                .from("specialties")
                                .delete()
                                .eq("id", specialty.id);

                            if (error) throw error;

                            Alert.alert("Success", "Specialty deleted successfully");
                            router.back();
                        } catch (error) {
                            console.error("Error:", error);
                            Alert.alert("Error", "Failed to delete specialty");
                        } finally {
                            setIsLoading(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="px-6 pt-14 pb-6 bg-white">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
                        >
                            <ChevronLeft size={24} color={colors.text} />
                        </TouchableOpacity>
                        <Text className="font-bold text-xl text-gray-900 ml-4">
                            Détails de la spécialité
                        </Text>
                    </View>
                    <View className="flex-row gap-2">
                        {!isEditing ? (
                            <>
                                <TouchableOpacity
                                    onPress={() => setIsEditing(true)}
                                    className="w-10 h-10 items-center justify-center rounded-full bg-primary-100"
                                >
                                    <Edit2 size={20} color={colors.primary} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleDelete}
                                    className="w-10 h-10 items-center justify-center rounded-full bg-red-100"
                                >
                                    <Trash2 size={20} color="rgb(220 38 38)" />
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity
                                onPress={handleUpdate}
                                className="w-10 h-10 items-center justify-center rounded-full bg-primary"
                            >
                                <Save size={20} color="white" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>

            {/* Content */}
            <ScrollView className="flex-1 p-6">
                <View className="space-y-4">
                    {/* Name Input */}
                    <View>
                        <Text className="text-sm font-medium text-gray-700 mb-1">
                            Nom de la spécialité
                        </Text>
                        <View className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 h-12">
                            <Hash size={20} color={colors.text} className="opacity-50" />
                            <TextInput
                                value={specialty.name}
                                onChangeText={(text) => setSpecialty(prev => ({ ...prev, name: text }))}
                                placeholder="Nom de la spécialité"
                                placeholderTextColor="#9CA3AF"
                                className="flex-1 ml-3"
                                editable={isEditing}
                            />
                        </View>
                    </View>

                    {/* Color Input */}
                    <View>
                        <Text className="text-sm font-medium text-gray-700 mb-1">
                            Couleur
                        </Text>
                        <View className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 h-12">
                            <Palette size={20} color={colors.text} className="opacity-50" />
                            <TextInput
                                value={specialty.hexColor}
                                onChangeText={(text) => setSpecialty(prev => ({ ...prev, hexColor: text }))}
                                placeholder="Code hexadécimal de la couleur"
                                placeholderTextColor="#9CA3AF"
                                className="flex-1 ml-3"
                                editable={isEditing}
                            />
                        </View>
                    </View>

                    {/* Color Preview */}
                    <View>
                        <Text className="text-sm font-medium text-gray-700 mb-1">
                            Aperçu de la couleur
                        </Text>
                        <View className="flex-row items-center justify-between bg-white rounded-xl border border-gray-200 p-4">
                            <Text className="text-gray-700">Couleur sélectionnée:</Text>
                            <View
                                style={{ backgroundColor: specialty.hexColor }}
                                className="w-10 h-10 rounded-full border border-gray-300"
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

