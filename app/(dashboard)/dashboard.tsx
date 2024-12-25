import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { Bell, Search, Star, Calendar, Clock } from "lucide-react-native";
import { useRouter } from "expo-router";
import RadioCategory from "@/assets/images/radioCategory.svg";
import BioCategory from "@/assets/images/bioCategory.svg";
import MedicationCategory from "@/assets/images/medicationCategory.svg";
import ConsultationCategory from "@/assets/images/consultationsCategory.svg";
import QuickAccess from "@/assets/images/QuickAcess.svg";

export default function Dashboard() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header Section */}
      <View className="px-6 pt-14 pb-6 bg-white">
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center space-x-3">
            <Image
              source={{ uri: "/placeholder.svg?height=40&width=40" }}
              className="w-10 h-10 rounded-full"
            />
            <View>
              <Text className="text-gray-600 text-base">bonjour,</Text>
              <Text className="text-gray-900 text-xl font-semibold">Nigel</Text>
            </View>
          </View>
          <TouchableOpacity>
            <Bell size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 h-12">
          <Search size={20} color={colors.text} className="opacity-50" />
          <TextInput
            placeholder="Recherche"
            className="flex-1 ml-3 text-base"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Medical Planning Section */}
        <View className="ml-6  py-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            mon planning médical:
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex flex-row gap-4 "
          >
            {/* Appointment Cards */}
            <View className="w-64 bg-indigo-600 rounded-3xl p-4 mr-4">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex flex-row items-center gap-x-3">
                  <Image
                    source={{ uri: "/placeholder.svg?height=40&width=40" }}
                    className="w-10 h-10 rounded-full bg-white"
                  />
                  <View>
                    <Text className="text-white font-medium">Jason Smith</Text>
                    <Text className="text-indigo-200">Dentist</Text>
                  </View>
                </View>
                <View className=" flex-row items-center">
                  <Text className="text-white mr-1">4.8</Text>
                  <Star size={16} color="#FCD34D" fill="#FCD34D" />
                </View>
              </View>
              <View className=" flex flex-row items-center gap-x-4 mt-2">
                <View className="flex-row items-center gap-x-2">
                  <Calendar size={16} color="#E0E7FF" className="mr-2" />
                  <Text className="text-indigo-100">5 Oct</Text>
                </View>
                <View className="flex-row items-center gap-x-2">
                  <Clock size={16} color="#E0E7FF" className="mr-2" />
                  <Text className="text-indigo-100">10:30pm</Text>
                </View>
              </View>
            </View>

            <View className="w-64 bg-blue-500 rounded-3xl p-4">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-x-3">
                  <Image
                    source={{ uri: "/placeholder.svg?height=40&width=40" }}
                    className="w-10 h-10 rounded-full bg-white"
                  />
                  <View>
                    <Text className="text-white font-medium">Melisa Adan</Text>
                    <Text className="text-blue-200">Pediatrician</Text>
                  </View>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-white mr-1">4.8</Text>
                  <Star size={16} color="#FCD34D" fill="#FCD34D" />
                </View>
              </View>
              <View className="flex-row items-center gap-x-4 mt-2">
                <View className="flex-row items-center gap-x-2">
                  <Calendar size={16} color="#BFDBFE" className="mr-2" />
                  <Text className="text-blue-100">6 Oct</Text>
                </View>
                <View className="flex-row items-center gap-x-2">
                  <Clock size={16} color="#BFDBFE" className="mr-2" />
                  <Text className="text-blue-100">10:00pm</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Categories Section */}
        <View className="px-6 pb-6 h-full">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Categories
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {[
              {
                title: "mes Examens\nradiologiques",
                image: RadioCategory,
                route: "/list-examins-radiologiques",
              },
              {
                title: "mes Examens\nBiologiques",
                image: BioCategory,
                route: "/list-biologie",
              },
              {
                title: "Mes\nMedicaments",
                image: MedicationCategory,
                route: "/list-medicaments",
              },
              {
                title: "Mes\nConsultations",
                image: ConsultationCategory,
                route: "/list-consultations",
              },
              {
                title: "Acces\nRapides",
                image: QuickAccess,
                route: "/acces-rapides",
              },
            ].map((category, index) => (
              <TouchableOpacity
                key={index}
                className="w-[30%] aspect-square bg-white rounded-3xl p-4 mb-4 items-center justify-between"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
                onPress={() => router.push(category.route as any)}
              >
                <category.image className="w-12 h-12" />
                <Text className="text-center text-gray-900 text-sm">
                  {category.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
