import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { Search, ChevronLeft } from "lucide-react-native";
import QuickAccess from "@/assets/images/QuickAcess.svg";
import Frequence from "@/assets/images/frequence.svg";
import Glucose from "@/assets/images/glucose.svg";
import Tension from "@/assets/images/tension.svg";
import FrequenceCardiaque from "@/assets/images/frequence-cardiaque.svg";
import Taille from "@/assets/images/taille.svg";
import Weight from "@/assets/images/poids.svg";

const quickAccessItems = [
  {
    id: 1,
    title: "Fréquence\ncardiaque",
    icon: Frequence,
    route: "/heart-rate",
    bgColor: "bg-purple-100",
    iconColor: "#6B46C1",
  },

  {
    id: 2,
    title: "Glucose\nsanguin",
    icon: Glucose,
    route: "/blood-glucose",
    bgColor: "bg-blue-100",
    iconColor: "#3B82F6",
  },
  {
    id: 3,
    title: "Fréquence\nrespiratoire",
    icon: FrequenceCardiaque,
    route: "/respiratory-rate",
    bgColor: "bg-indigo-100",
    iconColor: "#4F46E5",
  },
  {
    id: 4,
    title: "Tension\nartérielle",
    icon: Tension,
    route: "/blood-pressure",
    bgColor: "bg-pink-100",
    iconColor: "#DB2777",
  },
  {
    id: 5,
    title: "Taille",
    icon: Taille,
    route: "/height",
    bgColor: "bg-violet-100",
    iconColor: "#7C3AED",
  },
  {
    id: 6,
    title: "Poids",
    icon: Weight,
    route: "/weight",
    bgColor: "bg-purple-100",
    iconColor: "#6B46C1",
  },
];

export default function AccesRapide() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-6 pt-2.5 pb-2 bg-white">
        <View className="flex  flex-row items-center justify-between">
          <View className="w-2/3 flex flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
            >
              <ChevronLeft size={34} color="#4F46E5" />
            </TouchableOpacity>
            <View className="flex-1 ml-4 h-full">
              <Text className="text-primary-500 text-3xl font-extrabold">
                Accès rapide
              </Text>
            </View>
          </View>
          <QuickAccess width={100} height={80} />
        </View>
      </View>

      {/* Quick Access Grid */}
      <ScrollView className="flex-1 px-4 pt-6">
        <View className="flex-row flex-wrap justify-between">
          {quickAccessItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => router.push(item.route as any)}
                className={`w-[48%] aspect-square mb-4 rounded-3xl ${item.bgColor} p-4 justify-between`}
              >
                <Text className="text-gray-900 text-[26px] font-extrabold">
                  {item.title}
                </Text>
                <View className="flex-row justify-end">
                  <IconComponent width={56} height={56} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
