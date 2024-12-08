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
  Calendar,
  Search,
  Building2,
  User2,
  Plus,
  ChevronLeft,
} from "lucide-react-native";
import { supabase } from "@/utils/supabase";
import SupabaseFile from "@/components/supabaseFile";
import ExamenDetailPopup from "@/components/ExamenDetailPopup";

export default function ListRadiologie() {
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
        console.log("dataaa", data);
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

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const handleExamenPress = async (examen: any) => {
    setSelectedExamen(examen);
    await sleep(333);
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
    <SafeAreaView
      className="flex-1 bg-gray-50"
      style={{ position: "relative" }}
    >
      {/* Header */}
      <View className="bg-white px-4 pt-14 pb-4">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full bg-indigo-100"
          >
            <ChevronLeft size={24} color="#4F46E5" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-indigo-600">
            Mes examens Radiologiques
          </Text>
          <TouchableOpacity
            onPress={addRadiologie}
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

      {/* Radiologies List */}
      <ScrollView className="flex-1 px-4 pt-4">
        {radiologies.map((radio: any) => (
          <TouchableOpacity
            key={radio.id}
            onPress={() => handleExamenPress(radio)}
          >
            <View className="bg-white rounded-xl mb-4 overflow-hidden shadow-sm">
              <View className="flex-row p-4">
                {/* Date Column */}
                <View className="items-center mr-4">
                  <Calendar size={24} color="#4F46E5" />
                  <Text className="text-xs font-medium mt-1">
                    {new Date(radio.date).getDate()}
                  </Text>
                  <Text className="text-xs">
                    {new Date(radio.date).toLocaleString("default", {
                      month: "short",
                    })}
                  </Text>
                  <Text className="text-xs">
                    {new Date(radio.date).getFullYear()}
                  </Text>
                </View>

                {/* Main Content */}
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900 mb-2">
                    {radio.name}
                  </Text>

                  {/* Laboratory Info */}
                  <View className="flex-row items-center mb-2">
                    <Building2 size={16} color="#666" />
                    <Text className="text-sm text-gray-600 ml-2">
                      {radio.labName}
                    </Text>
                  </View>

                  {/* Doctor Info */}
                  <View className="flex-row items-center mb-3">
                    <User2 size={16} color="#666" />
                    <Text className="text-sm text-gray-600 ml-2">
                      {radio.phone}
                    </Text>
                  </View>

                  {/* Action Buttons */}
                  <View className="flex-row justify-between">
                    <TouchableOpacity
                      className="bg-indigo-600 px-4 py-2 rounded-full"
                      onPress={() => handleExamenPress(radio)}
                    >
                      <Text className="text-white text-sm font-medium">
                        Détail
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="px-4 py-2 rounded-full border border-indigo-500">
                      <Text className="text-sm font-medium text-indigo-500">
                        {radio?.uploads?.length
                          ? `${radio.uploads.length} fichier(s)`
                          : "Aucun fichier"}
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
    </SafeAreaView>
  );
}
