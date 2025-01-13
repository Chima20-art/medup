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

export default function BloodPressure() {
  const router = useRouter();
  const [date, setDate] = useState(new Date());
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [isEnteringSystolic, setIsEnteringSystolic] = useState(true);

  const [values, setValues] = useState<
    {
      id: number;
      date: Date;
      systolic: string;
      diastolic: string;
      createdAt: string;
    }[]
  >([]);
  const [showAddValue, setShowAddValue] = useState(false);

  console.log("values", values.length);

  const fetchValues = async () => {
    const { data, error } = await supabase
      .from("blood pressure")
      .select()
      .order("date", { ascending: false });
    if (error) {
      console.error("Error fetching blood pressure values:", error);
      return;
    }
    setValues(data);
  };

  useEffect(() => {
    fetchValues();
  }, []);

  const handleNumberPress = (num: string) => {
    if (isEnteringSystolic) {
      if (systolic.length < 3) {
        setSystolic(systolic + num);
        if (systolic.length === 2) {
          setIsEnteringSystolic(false);
        }
      }
    } else {
      if (diastolic.length < 3) {
        setDiastolic(diastolic + num);
      }
    }
  };

  const handleDeletePress = () => {
    if (!isEnteringSystolic && diastolic === "") {
      setIsEnteringSystolic(true);
    } else if (isEnteringSystolic) {
      setSystolic(systolic.slice(0, -1));
    } else {
      setDiastolic(diastolic.slice(0, -1));
    }
  };

  const handleDone = async () => {
    // Save the value to your database here
    //router.back();

    if (isEnteringSystolic) {
      setIsEnteringSystolic(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("blood pressure")
        .insert({ date, systolic, diastolic });
      if (error) {
        console.error("Error saving blood pressure value:", error);
      }
      console.log("data", data);
      fetchValues();
    } catch (error) {
      console.error("Error saving blood pressure value:", error);
    } finally {
      setShowAddValue(false);
    }
  };

  if (showAddValue) {
    return (
      <MetricInputTemplate
        title="Blood pressure"
        value={isEnteringSystolic ? systolic : diastolic}
        //secondaryValue={diastolic}
        date={date}
        onDateChange={(event: any, selectedDate: any) => {
          if (selectedDate) setDate(selectedDate);
        }}
        onNumberPress={handleNumberPress}
        onDeletePress={handleDeletePress}
        onDonePress={handleDone}
        unit="systolic"
        secondaryUnit="diastolic"
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center justify-between px-4 py-2">
        <TouchableOpacity onPress={() => router.back()} className="">
          <ArrowLeftIcon size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold">blood pressure</Text>
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
              <Text className="text-lg">
                {item.systolic} / {item.diastolic} mmhg
              </Text>
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
