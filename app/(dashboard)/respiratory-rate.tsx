import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import MetricInputTemplate from "@/components/metricInputLayout";
import { supabase } from "@/utils/supabase";
import {
  FlatList,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ArrowLeftIcon } from "lucide-react-native";

export default function RespiratoryRate() {
  const router = useRouter();
  const [date, setDate] = useState(new Date());
  const [value, setValue] = useState("");
  const [values, setValues] = useState<
    {
      id: number;
      date: Date;
      value: string;
      createdAt: string;
    }[]
  >([]);
  const [showAddValue, setShowAddValue] = useState(false);

  console.log("values", values.length);

  const fetchValues = async () => {
    const { data, error } = await supabase
      .from("blood oxygen")
      .select()
      .order("date", { ascending: false });
    if (error) {
      console.error("Error fetching blood oxygen values:", error);
      return;
    }
    setValues(data);
  };

  useEffect(() => {
    fetchValues();
  }, []);

  const handleNumberPress = (num: string) => {
    if (num === "." && value.includes(".")) return;
    if (value.includes(".") && value.split(".")[1].length >= 2) return;
    setValue(value + num);
  };

  const handleDeletePress = () => {
    setValue(value.slice(0, -1));
  };

  const handleDone = async () => {
    // Save the value to your database here
    //router.back();
    try {
      const { data, error } = await supabase
        .from("blood oxygen")
        .insert({ date, value });
      if (error) {
        console.error("Error saving blood oxygen value:", error);
      }
      console.log("data", data);
      fetchValues();
    } catch (error) {
      console.error("Error saving blood oxygen value:", error);
    } finally {
      setShowAddValue(false);
    }
  };

  if (showAddValue) {
    return (
      <MetricInputTemplate
        title="blood oxygen"
        value={value}
        date={date}
        onDateChange={(event: any, selectedDate: any) => {
          if (selectedDate) setDate(selectedDate);
        }}
        onNumberPress={handleNumberPress}
        onDeletePress={handleDeletePress}
        onDonePress={handleDone}
        unit="bpm"
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center justify-between px-4 py-2">
        <TouchableOpacity onPress={() => router.back()} className="">
          <ArrowLeftIcon size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold">blood oxygen</Text>
        <TouchableOpacity
          className="p-2 bg-primary-500 rounded-md"
          onPress={() => setShowAddValue(true)}
        >
          <Text className="text-white">Add</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={values}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-200">
            <View>
              <Text className="text-lg">{item.value} bpm</Text>
              <Text className="text-gray-500">
                {new Date(item.date).toLocaleDateString()}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View className="p-4">
            <Text className="text-gray-500 text-center">No readings yet</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
