import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Search, Building2, User2, Plus } from 'lucide-react-native';
import ExamenDetailPopup from '@/components/ExamenDetailPopup';

// Mock data for the list
const mockExamens = [
    {
        id: '1',
        date: '30 jul 24',
        name: "le nom de l'examen biologique",
        laboratory: 'labo dar el bir',
        doctor: 'DR. benjelloune',
        status: 'recent',
        location: 'lieu de réalisation',
        notes: 'ex : pensez à refaire cet examen dans 6 mois',
        images: ['/placeholder.svg?height=300&width=300']
    },
    {
        id: '2',
        date: '30 jul 24',
        name: "le nom de l'examen biologique",
        laboratory: 'labo dar el bir',
        doctor: 'DR. benjelloune',
        status: 'ancien',
        location: 'lieu de réalisation',
        notes: 'ex : pensez à refaire cet examen dans 6 mois',
        images: ['/placeholder.svg?height=300&width=300']
    },
    {
        id: '3',
        date: '30 jul 24',
        name: "le nom de l'examen biologique",
        laboratory: 'labo dar el bir',
        doctor: 'DR. benjelloune',
        status: 'statut',
        location: 'lieu de réalisation',
        notes: 'ex : pensez à refaire cet examen dans 6 mois',
        images: ['/placeholder.svg?height=300&width=300']
    }
];

export default function ExamensBiologiquesList() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedExamen, setSelectedExamen] = useState(null);
    const slideAnim = useRef(new Animated.Value(0)).current;

    const handleAddBiologiqalExamen = () => {
        router.push('/add-examin-biologique');
    };

    const handleExamenPress = (examen: any) => {
        setSelectedExamen(examen);
        Animated.spring(slideAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
        }).start();
    };

    const handleClosePopup = () => {
        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
        }).start(() => setSelectedExamen(null));
    };

    return (
        <View className="flex-1 bg-gray-50" style={{ position: 'relative' }}>
            {/* Header */}
            <View className="bg-white px-4 pt-14 pb-4">
                <View className="flex-row items-center justify-between mb-4">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 items-center justify-center rounded-full bg-indigo-100"
                    >
                        <Text className="text-indigo-600 text-xl">&larr;</Text>
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-indigo-600">Mes examens Biologiques</Text>
                    <TouchableOpacity
                        onPress={handleAddBiologiqalExamen}
                        className="w-10 h-10 items-center justify-center rounded-full bg-indigo-600"
                    >
                        <Plus size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View className="flex-row items-center bg-gray-100 rounded-xl px-4 h-12">
                    <Search size={20} color="#666" />
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Recherche"
                        className="flex-1 ml-2"
                    />
                </View>
            </View>

            {/* Examens List */}
            <ScrollView className="flex-1 px-4 pt-4">
                {mockExamens.map((examen) => (
                    <TouchableOpacity key={examen.id} onPress={() => handleExamenPress(examen)}>
                        <View className="bg-white rounded-xl mb-4 overflow-hidden shadow-sm">
                            <View className="flex-row p-4">
                                {/* Date Column */}
                                <View className="items-center mr-4">
                                    <Calendar size={24} color="#4F46E5" />
                                    <Text className="text-xs font-medium mt-1">{examen.date.split(' ')[0]}</Text>
                                    <Text className="text-xs">{examen.date.split(' ')[1]}</Text>
                                    <Text className="text-xs">{examen.date.split(' ')[2]}</Text>
                                </View>

                                {/* Main Content */}
                                <View className="flex-1">
                                    <Text className="font-semibold text-gray-900 mb-2">{examen.name}</Text>

                                    {/* Laboratory Info */}
                                    <View className="flex-row items-center mb-2">
                                        <Building2 size={16} color="#666" />
                                        <Text className="text-sm text-gray-600 ml-2">{examen.laboratory}</Text>
                                    </View>

                                    {/* Doctor Info */}
                                    <View className="flex-row items-center mb-3">
                                        <User2 size={16} color="#666" />
                                        <Text className="text-sm text-gray-600 ml-2">{examen.doctor}</Text>
                                    </View>

                                    {/* Action Buttons */}
                                    <View className="flex-row justify-between">
                                        <TouchableOpacity
                                            className="bg-indigo-600 px-4 py-2 rounded-full"
                                        >
                                            <Text className="text-white text-sm font-medium">Détail</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            className={`px-4 py-2 rounded-full border ${
                                                examen.status === 'recent'
                                                    ? 'border-blue-500'
                                                    : examen.status === 'ancien'
                                                        ? 'border-gray-500'
                                                        : 'border-indigo-500'
                                            }`}
                                        >
                                            <Text
                                                className={`text-sm font-medium ${
                                                    examen.status === 'recent'
                                                        ? 'text-blue-500'
                                                        : examen.status === 'ancien'
                                                            ? 'text-gray-500'
                                                            : 'text-indigo-500'
                                                }`}
                                            >
                                                {examen.status.charAt(0).toUpperCase() + examen.status.slice(1)}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {selectedExamen && (
                <ExamenDetailPopup
                    examen={selectedExamen}
                    slideAnim={slideAnim}
                    onClose={handleClosePopup}
                />
            )}
        </View>
    );
}