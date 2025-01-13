import React from "react";
import { View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";

interface MetricInputTemplateProps {
  title: string;
  value: string;
  date: Date;
  onDateChange: (event: any, selectedDate?: Date) => void;
  onNumberPress: (num: string) => void;
  onDeletePress: () => void;
  onDonePress: () => void;
  unit?: string;
  secondaryValue?: string;
  secondaryUnit?: string;
  isEnteringSystolic?: boolean;
}

export default function MetricInputTemplate({
  title,
  value,
  date,
  onDateChange,
  onNumberPress,
  onDeletePress,
  onDonePress,
  unit,
  secondaryValue,
  secondaryUnit,
  isEnteringSystolic,
}: MetricInputTemplateProps) {
  const router = useRouter();

  const renderNumpad = () => {
    const numbers = [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      ".",
      "0",
      "⌫",
    ];
    return (
      <View className="flex-row flex-wrap justify-between px-4 w-full">
        {numbers.map((num) => (
          <TouchableOpacity
            key={num}
            onPress={() => (num === "⌫" ? onDeletePress() : onNumberPress(num))}
            className="w-[30%] h-16 items-center justify-center mb-4"
          >
            <Text className="text-2xl text-gray-900">{num}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-2">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Text className="text-rose-500">Cancel</Text>
        </TouchableOpacity>
        <Text className="text-xl font-semibold">{title}</Text>
        <TouchableOpacity onPress={onDonePress} className="p-2">
          <Text className="text-primary">Done</Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker */}
      <View className="px-4 py-2">
        <DateTimePicker
          value={date}
          onChange={onDateChange}
          display="spinner"
          mode="date"
          textColor="black"
        />
      </View>

      {/* Value Display */}
      <View className="items-center justify-center py-8">
        <View className="flex-row items-end">
          <Text className="text-6xl text-gray-900">{value}</Text>
          {unit && (
            <Text className="text-xl text-gray-600 mb-2 ml-2">{unit}</Text>
          )}
        </View>
        {secondaryValue && (
          <View className="flex-row items-end mt-2">
            <Text className="text-6xl text-gray-900">{secondaryValue}</Text>
            {secondaryUnit && (
              <Text className="text-xl text-gray-600 mb-2 ml-2">
                {secondaryUnit}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Numpad */}
      {renderNumpad()}
    </SafeAreaView>
  );
}
