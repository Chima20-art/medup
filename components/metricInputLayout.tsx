import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, Platform, TextInput } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { Calendar, ChevronLeft } from "lucide-react-native";

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
    isBloodPressure?: boolean;
    isEnteringSystolic?: boolean;
    onDateConfirm: (date: Date) => void;
    onChangeValue: (value: string) => void;
    onChangeSecondaryValue: (value: string) => void;
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
                                                isBloodPressure,
                                                isEnteringSystolic,
                                                onDateConfirm,
                                                onChangeValue,
                                                onChangeSecondaryValue
                                            }: MetricInputTemplateProps) {
    const router = useRouter();
    const [pickedDate, setPickedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        setPickedDate(date);
    }, [date]);

    const renderNumpad = () => {
        const numbers = [
            "1", "2", "3",
            "4", "5", "6",
            "7", "8", "9",
            ",", "0", "⌫",
        ];
        return (
            <View className="flex-row flex-wrap justify-between px-4 w-full">
                {numbers.map((num) => (
                    <TouchableOpacity
                        key={num}
                        onPress={() => (num === "⌫" ? onDeletePress() : onNumberPress(num === "," ? "." : num))}
                        className="w-[30%] h-16 items-center justify-center mb-4"
                    >
                        <Text className="text-2xl text-gray-900">{num}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <ChevronLeft size={24} color="#F43F5E" />
                </TouchableOpacity>
                <Text className="text-xl font-semibold text-gray-800">{title}</Text>
                <TouchableOpacity onPress={onDonePress} className="p-2">
                    <Text className="text-primary font-semibold">Terminé</Text>
                </TouchableOpacity>
            </View>

            <View className="flex-1 justify-between">
                {/* Date Picker */}
                <View className="px-6 py-4">
                    <TouchableOpacity
                        onPress={() => setShowDatePicker(true)}
                        className="flex-row justify-center items-center bg-gray-100 rounded-xl px-4 h-12"
                    >
                        <Calendar size={20} color="#4B5563" className="mr-2" />
                        <Text className="text-gray-700">{pickedDate.toLocaleDateString('fr-FR')}</Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker
                            value={pickedDate}
                            onChange={(event, selectedDate) => {
                                setShowDatePicker(Platform.OS === 'ios');
                                if (selectedDate) {
                                    setPickedDate(selectedDate);
                                    onDateConfirm(selectedDate);
                                }
                            }}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        />
                    )}
                </View>

                {/* Value Display */}
                <View className="items-center justify-center py-8">
                    {isBloodPressure ? (
                        <View className="flex-row items-end space-x-4">
                            {/* Systolic Value */}
                            <View className="items-center">
                                <TextInput
                                    className="text-6xl text-gray-900 text-center w-32"
                                    placeholder="---"
                                    placeholderTextColor="#9CA3AF"
                                    value={value}
                                    keyboardType="numeric"
                                    onChangeText={onChangeValue}
                                />
                                <Text className="text-lg text-gray-600 mt-2">Systolique</Text>
                                <Text className="text-base text-gray-500">mmHg</Text>
                            </View>

                            {/* Separator */}
                            <Text className="text-6xl text-gray-900 mb-2">/</Text>

                            {/* Diastolic Value */}
                            <View className="items-center">
                                <TextInput
                                    className="text-6xl text-gray-900 text-center w-32"
                                    placeholder="---"
                                    placeholderTextColor="#9CA3AF"
                                    value={secondaryValue}
                                    keyboardType="numeric"
                                    onChangeText={onChangeSecondaryValue}
                                />
                                <Text className="text-lg text-gray-600 mt-2">Diastolique</Text>
                                <Text className="text-base text-gray-500">mmHg</Text>
                            </View>
                        </View>
                    ) : (
                        <View className="items-center">
                            <View className="flex-row items-end">
                                <Text className="text-6xl text-gray-900">{value}</Text>
                                {unit && (
                                    <Text className="text-2xl text-gray-600 mb-2 ml-2">{unit}</Text>
                                )}
                            </View>
                            {secondaryValue && (
                                <View className="flex-row items-end mt-4">
                                    <Text className="text-4xl text-gray-700">{secondaryValue}</Text>
                                    {secondaryUnit && (
                                        <Text className="text-xl text-gray-500 mb-1 ml-2">
                                            {secondaryUnit}
                                        </Text>
                                    )}
                                </View>
                            )}
                        </View>
                    )}
                </View>

                {/* Numpad */}
                <View className="bg-gray-50 pt-4 pb-8 rounded-t-3xl shadow-inner">
                    {renderNumpad()}
                </View>
            </View>
        </SafeAreaView>
    );
}

