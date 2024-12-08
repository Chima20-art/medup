import SupabaseFile from "@/components/supabaseFile";
import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ListRadiologie() {
  const router = useRouter();
  const [radiologies, setRadiologies] = useState<any[]>([]);

  useEffect(() => {
    // Initial fetch of radiologies
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

    // Set up realtime subscription
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
          // Refetch all radiologies when there's any change
          const { data } = await supabase.from("radiologie").select("*");
          if (data) {
            setRadiologies(data);
          }
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const addRadiologie = () => {
    router.push("/examins-radiologiques");
  };

  return (
    <SafeAreaView className="flex-1 gap-4 mx-2 bg-gray-50">
      <Text className="text-xl font-semibold text-gray-900">
        List Radiologie
      </Text>
      <ScrollView>
        {radiologies.map((radio: any) => (
          <View
            key={radio.id}
            className="bg-white p-4 mb-2 rounded-md shadow-sm"
          >
            <Text className="text-gray-900">Name: {radio.name}</Text>
            <Text className="text-gray-900">
              Date: {new Date(radio.date).toLocaleDateString()}
            </Text>
            <Text className="text-gray-900">phone: {radio.phone}</Text>
            <Text className="text-gray-900">labName: {radio.labName}</Text>
            <Text className="text-gray-900">Notes: {radio.notes}</Text>
            <Text className="text-gray-900">
              Num of Files: {radio?.uploads?.length ?? 0}
            </Text>
            <View className="bg-red-300 w-full">
              {radio?.uploads?.map((upload: any) => (
                <SupabaseFile path={upload} />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
      <TouchableOpacity
        className="bg-blue-500 p-2 mb-2.5 rounded-md items-center justify-center"
        onPress={addRadiologie}
      >
        <Text className="text-white">Ajouter</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
