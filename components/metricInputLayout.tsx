import React, { useState, useEffect, useRef } from "react"
import { View, Text, TouchableOpacity, SafeAreaView, Platform, TextInput } from "react-native"
import DateTimePicker from "@react-native-community/datetimepicker"
import { useRouter } from "expo-router"
import { Calendar, ChevronLeft } from "lucide-react-native"

interface MetricInputTemplateProps {
    title: string
    value: string
    date: Date
    onDateChange: (event: any, selectedDate?: Date) => void
    onDonePress: () => void
    unit?: string
    secondaryValue?: string
    secondaryUnit?: string
    isBloodPressure?: boolean
    isEnteringSystolic?: boolean
    onDateConfirm: (date: Date) => void
    onChangeValue: (value: string) => void
    onChangeSecondaryValue: (value: string) => void
}

export default function MetricInputTemplate({
                                                title,
                                                value,
                                                date,
                                                onDateChange,
                                                onDonePress,
                                                unit,
                                                secondaryValue,
                                                secondaryUnit,
                                                isBloodPressure,
                                                isEnteringSystolic,
                                                onDateConfirm,
                                                onChangeValue,
                                                onChangeSecondaryValue,
                                            }: MetricInputTemplateProps) {
    const router = useRouter()
    const [pickedDate, setPickedDate] = useState(new Date())
    const [showDatePicker, setShowDatePicker] = useState(false)
    const inputRef = useRef<TextInput>(null)

    useEffect(() => {
        setPickedDate(date)
    }, [date])

    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
                <View className="flex-row items-center">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 justify-items-start rounded-full bg-gray-100"
                    >
                        <ChevronLeft size={34} color="#4F46E5" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold text-primary-500 ml-2">{title}</Text>
                </View>
                <TouchableOpacity onPress={onDonePress} className="p-2">
                    <Text className="text-primary font-semibold">Terminé</Text>
                </TouchableOpacity>
            </View>

            <View className="flex-1">
                {/* Date Picker */}
                <View className="px-6 py-4">
                    <TouchableOpacity
                        onPress={() => setShowDatePicker(true)}
                        className="flex-row justify-center items-center bg-gray-100 rounded-xl px-4 h-12"
                    >
                        <Calendar size={20} color="#4B5563" className="mr-2" />
                        <Text className="text-gray-700">{pickedDate.toLocaleDateString("fr-FR")}</Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker
                            value={pickedDate}
                            onChange={(event, selectedDate) => {
                                setShowDatePicker(Platform.OS === "ios")
                                if (selectedDate) {
                                    setPickedDate(selectedDate)
                                    onDateConfirm(selectedDate)
                                }
                            }}
                            mode="date"
                            display={Platform.OS === "ios" ? "spinner" : "default"}
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
                                    ref={inputRef}
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
                            <View className="flex flex-row justify-items-center items-end h-fit">
                                <TextInput
                                    ref={inputRef}
                                    className="text-6xl text-gray-900 text-center w-32 min-h-20"
                                    placeholder="---"
                                    placeholderTextColor="#9CA3AF"
                                    value={value}
                                    keyboardType="numeric"
                                    onChangeText={onChangeValue}
                                />
                                {unit && <Text className="text-2xl text-gray-600 mb-2 ml-2">{unit}</Text>}
                            </View>
                            {secondaryValue && (
                                <View className="flex-row items-end mt-4">
                                    <TextInput
                                        className="text-4xl text-gray-700 text-center w-24"
                                        placeholder="---"
                                        placeholderTextColor="#9CA3AF"
                                        value={secondaryValue}
                                        keyboardType="numeric"
                                        onChangeText={onChangeSecondaryValue}
                                    />
                                    {secondaryUnit && <Text className="text-xl text-gray-500 mb-1 ml-2">{secondaryUnit}</Text>}
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </View>
        </SafeAreaView>
    )
}

