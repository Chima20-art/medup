import React from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native'
import { useRouter } from 'expo-router'
import { Search, ChevronLeft, Heart, Droplets, Ruler, Weight } from 'lucide-react-native'
import QuickAccess from "@/assets/images/QuickAcess.svg"

const quickAccessItems = [
    {
        id: 1,
        title: 'Fréquence\ncardiaque',
        icon: Heart,
        route: '/heart-rate',
        bgColor: 'bg-purple-100',
        iconColor: '#6B46C1'
    },
    {
        id: 2,
        title: 'Glucose\nsanguin',
        icon: Droplets,
        route: '/blood-glucose',
        bgColor: 'bg-blue-100',
        iconColor: '#3B82F6'
    },
    {
        id: 3,
        title: 'Fréquence\nrespiratoire',
        icon: Heart,
        route: '/respiratory-rate',
        bgColor: 'bg-indigo-100',
        iconColor: '#4F46E5'
    },
    {
        id: 4,
        title: 'Tension\nartérielle',
        icon: Heart,
        route: '/blood-pressure',
        bgColor: 'bg-pink-100',
        iconColor: '#DB2777'
    },
    {
        id: 5,
        title: 'Taille',
        icon: Ruler,
        route: '/height',
        bgColor: 'bg-violet-100',
        iconColor: '#7C3AED'
    },
    {
        id: 6,
        title: 'Poids',
        icon: Weight,
        route: '/weight',
        bgColor: 'bg-purple-100',
        iconColor: '#6B46C1'
    }
]

export default function AccesRapide() {
    const router = useRouter()

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
                                    Accès
                                </Text>
                                <Text className="text-primary-500 text-3xl font-bold ml-1">
                                    rapide
                                </Text>
                            </View>
                        </View>
                    </View>
                    <QuickAccess className="" />
                </View>

                {/* Search Bar */}
                <View className="flex-row items-center bg-gray-100 rounded-xl px-4 h-12 mt-2">
                    <Search size={20} color="#9CA3AF" />
                    <TextInput
                        placeholder="Recherche"
                        className="flex-1 ml-3 text-base"
                        placeholderTextColor="#9CA3AF"
                    />
                </View>
            </View>

            {/* Quick Access Grid */}
            <ScrollView className="flex-1 px-4 pt-6">
                <View className="flex-row flex-wrap justify-between">
                    {quickAccessItems.map((item) => {
                        const IconComponent = item.icon
                        return (
                            <TouchableOpacity
                                key={item.id}
                                onPress={() => router.push(item.route as any)}
                                className={`w-[48%] aspect-square mb-4 rounded-3xl ${item.bgColor} p-4 justify-between`}
                            >
                                <IconComponent size={28} color={item.iconColor} />
                                <Text className="text-gray-900 text-lg font-medium">
                                    {item.title}
                                </Text>
                            </TouchableOpacity>
                        )
                    })}
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

