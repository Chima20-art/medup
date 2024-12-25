import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Search,
  Plus,
  ChevronLeft,
} from "lucide-react-native";
import { supabase } from "@/utils/supabase";
import ExamenDetailPopup from "@/components/ExamenDetailPopup";
import Hospital from "@/assets/images/hospital.svg";
import Doctor from "@/assets/images/doctor.svg";
import RadioCategory from "@/assets/images/radioCategory.svg";

export default function ListExaminsRadiologiques() {
  const router = useRouter();
  const [radiologies, setRadiologies] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExamen, setSelectedExamen] = useState(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchRadiologies = async () => {
      const { data, error } = await supabase.from("radiologie").select("*");
      if (data) {
        setRadiologies(data);
      }
      if (error) {
        console.error("Error fetching radiologies:", error);
      }
    };

    fetchRadiologies();

    const subscription = supabase
        .channel("radiologie_changes")
        .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "radiologie",
            },
            async (payload) => {
              const { data } = await supabase.from("radiologie").select("*");
              if (data) {
                setRadiologies(data);
              }
            }
        )
        .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const addRadiologie = () => {
    router.push("/add-examin-radiologique");
  };

  const handleExamenPress = async (examen: any) => {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleString('default', { month: 'short' }),
      year: date.getFullYear().toString().slice(2)
    };
  };

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
                  Mes examens
                </Text>
                <Text className="text-primary-500 text-3xl font-bold ml-1">
                  radiologiques
                </Text>
              </View>
            </View>
          </View>
            <RadioCategory className="" />
          </View>

          {/* Search Bar */}
          <View className="flex-row items-center bg-gray-100 rounded-xl px-4 h-12 mt-2">
            <Search size={20} color="#9CA3AF" />
            <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Recherche"
                className="flex-1 ml-3 text-base"
                placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Radiologies List */}
        <ScrollView className="flex-1 px-4 pt-4">
          {radiologies.map((radio: any) => {
            const date = formatDate(radio.date);
            return (
                <TouchableOpacity
                    key={radio.id}
                    onPress={() => handleExamenPress(radio)}
                    className="mb-4 flex-row items-stretch px-2"
                >
                  <View className="bg-primary-500 w-16 py-4 items-center justify-center rounded-full my-2 mr-2">
                    <Text className="text-white text-2xl font-bold">{date.day}</Text>
                    <Text className="text-white uppercase">{date.month}</Text>
                    <Text className="text-white">{date.year}</Text>
                  </View>
                  <View className="flex-1 bg-white rounded-3xl p-4 shadow-sm">
                    <Text className="text-gray-900 font-medium mb-2">
                      {radio.name}
                    </Text>

                    {/* Laboratory Info */}
                    <View className="flex-row items-center mb-2">
                      <Hospital />
                      <Text className="text-sm text-gray-600 ml-2">
                        {radio.labName}
                      </Text>
                    </View>

                    {/* Doctor Info */}
                    <View className="flex-row items-center mb-3">
                      <Doctor />
                      <Text className="text-sm text-gray-600 ml-2">
                        {radio.phone}
                      </Text>
                    </View>

                    {/* Action Buttons */}
                    <View className="flex-row gap-x-2 justify-end">
                      <TouchableOpacity
                          className="bg-primary px-4 py-2 rounded-xl"
                          onPress={() => handleExamenPress(radio)}
                      >
                        <Text className="text-white text-sm font-medium">
                          Détail
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity className="px-4 py-2 border border-primary rounded-xl">
                        <Text className="text-sm font-medium text-primary">
                          {radio?.uploads?.length
                              ? `${radio.uploads.length} fichier(s)`
                              : "Aucun fichier"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Add Button */}
        <TouchableOpacity
            onPress={addRadiologie}
            className="absolute bottom-6 right-6 w-14 h-14 items-center justify-center rounded-full bg-primary shadow-lg"
        >
          <Plus size={24} color="white" />
        </TouchableOpacity>

        {selectedExamen && slideAnim ? (
            <ExamenDetailPopup
                examen={selectedExamen}
                slideAnim={slideAnim}
                onClose={handleClosePopup}
                bucket="radiologie"
            />
        ) : null}
      </SafeAreaView>
  );
}

