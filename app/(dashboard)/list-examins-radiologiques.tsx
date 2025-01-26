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
import { Search, Plus, ChevronLeft } from "lucide-react-native";
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
      const { data, error } = await supabase
        .from("radiologie")
        .select("*")
        .order("created_at", { ascending: false });
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

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const handleExamenPress = async (examen: any) => {
    setSelectedExamen(examen);
    await sleep(500);
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
      month: date.toLocaleString("default", { month: "short" }),
      year: date.getFullYear().toString().slice(2),
    };
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-2 pb-4">
        <View className="flex-row relative items-center justify-between mb-2 ">
          <View className="flex-col flex-1 mr-2">
            <View className="flex-row items-start gap-x-2">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
              >
                <ChevronLeft size={26} color="#4F46E5" />
              </TouchableOpacity>
              <View className="w-full flex flex-col items-start flex-1">
                <Text className="w-full text-primary-500 text-[24px] font-extrabold">
                  Mes examens {"\n"} radiologiques
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
          <RadioCategory width={140} height={100} />
        </View>
      </View>

      {/* Radiologies List */}
      <ScrollView className="flex-1 px-4 pt-4">
        {radiologies.length === 0 ? (
          <View className="flex-1 items-center justify-center py-8">
            <Text className="text-gray-500 text-lg font-medium">
              Aucun examen radiologique trouvé
            </Text>
          </View>
        ) : (
          radiologies.map((radio: any) => {
            const date = formatDate(radio.date);
            return (
              <TouchableOpacity
                key={radio.id}
                onPress={() => handleExamenPress(radio)}
                className="mb-4 flex-row items-stretch px-2"
              >
                {/*date*/}
                <View className="bg-primary-500 w-16 py-4 items-center justify-center rounded-full my-2 mr-2">
                  <Text className="text-white text-2xl font-bold">
                    {date.day}
                  </Text>
                  <Text className="text-white uppercase">{date.month}</Text>
                  <Text className="text-white">{date.year}</Text>
                </View>

                {/*detailed card*/}
                <View className="flex-1 bg-white rounded-3xl p-4 shadow-sm">
                  <Text className="text-gray-900 text-lg font-bold mb-2">
                    {radio.name}
                  </Text>

                  <View className="flex-col ml-6 ">
                    {/* Laboratory Info */}
                    <View className="flex-row items-center mb-2 w-fit ">
                      <Hospital />
                      <Text className="text-base font-semibold text-gray-600 ml-2">
                        {radio.labName}
                      </Text>
                    </View>

                    {/* Doctor Info */}
                    <View className="flex-row items-center mb-2 w-fit">
                      <Doctor />
                      <Text className="text-base font-semibold text-gray-600 ml-2">
                        {radio.phone}
                      </Text>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View className="flex-row gap-x-2 justify-end">
                    {/*<TouchableOpacity*/}
                    {/*  className="bg-primary px-4 py-2 rounded-xl"*/}
                    {/*  onPress={() => handleExamenPress(radio)}*/}
                    {/*>*/}
                    {/*  <Text className="textwhite text-sm font-medium">*/}
                    {/*    Détail*/}
                    {/*  </Text>*/}
                    {/*</TouchableOpacity>*/}

                    <TouchableOpacity
                      className="px-4 py-2 bg-primary-500 rounded-xl"
                      onPress={() => handleExamenPress(radio)}
                    >
                      <Text className="text-xs font-medium text-secondary">
                        {radio?.uploads?.length
                          ? `${radio.uploads.length} fichier(s)`
                          : "Aucun fichier"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

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
