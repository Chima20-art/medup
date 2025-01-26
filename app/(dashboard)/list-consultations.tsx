import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { Search, ChevronLeft } from "lucide-react-native";
import ConsultationCategory from "@/assets/images/consultationsCategory.svg";
import ConsultationDetailPopup from "@/components/ConsultationDetailPopup";
import ConsultationCards from "@/components/ConsultationCards";

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

export default function ListConsultations() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConsultation, setSelectedConsultation] =
    useState<Consultation | null>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const handleConsultationPress = useCallback(
    async (consultation: Consultation) => {
      setSelectedConsultation(consultation);
      await new Promise((resolve) => setTimeout(resolve, 100));
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    },
    [slideAnim]
  );

  const handleClosePopup = useCallback(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start(() => setSelectedConsultation(null));
  }, [slideAnim]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Header */}
        <View className="bg-white px-2 pb-4">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-col flex-1 mr-2">
              <View className="flex-row items-start gap-x-2">
                <TouchableOpacity
                  onPress={() => router.back()}
                  className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
                >
                  <ChevronLeft size={24} color="#4F46E5" />
                </TouchableOpacity>
                <View className="flex-col items-startflex-1">
                  <Text className="text-primary-500 text-[24px] font-extrabold">
                    Mes {"\n"} Consultations
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
            <ConsultationCategory />
          </View>
        </View>

        {/* Consultations Cards */}
        <ConsultationCards
          searchQuery={searchQuery}
          onConsultationPress={handleConsultationPress}
        />

        {selectedConsultation && slideAnim ? (
          <ConsultationDetailPopup
            consultation={selectedConsultation}
            slideAnim={slideAnim}
            onClose={handleClosePopup}
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
}
