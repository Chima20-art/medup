import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, Image } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Signup5 from "@/assets/images/signup-5.svg";

import DateTimePicker, {DateTimePickerEvent} from "@react-native-community/datetimepicker";

export default function DateOfBirthStep({ onContinue }: { onContinue: (date: Date) => void }) {
    const { colors } = useTheme();
    const [date, setDate] = useState(new Date());

    const handleDateChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || date;
        setDate(currentDate);
    };

    const formattedDate = new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long',  // Full weekday name (e.g., "mercredi")
        year: 'numeric',
        month: 'long',    // Full month name (e.g., "décembre")
        day: 'numeric',   // Day of the month
    }).format(date);


    return (
        <View className="flex-1 pt-16">

            <View style={{ marginHorizontal: 'auto' }}> {/* Adjust spacing here */}
                <Signup5
                    width={250} height={250}
                />
            </View>
            <View className="h-16 flex-row items-center justify-center px-5">
                <View className="flex flex-row gap-x-0.5">
                    {[1, 2, 3, 4, 5, 6].map((step) => (
                        <View
                            key={step}
                            className={`h-1 w-10 rounded-full`}
                            style={{
                                backgroundColor: step <= 5 ? colors.primary : colors.border,
                            }}
                        />
                    ))}
                </View>
            </View>

            <View className="flex-1 px-2">
                <Text className="text-2xl font-bold text-center mt-6 " style={{ color: colors.text }}>
                    Quelle est votre date de naissance ?
                </Text>
                <Text className="text-xl font-semibold mb-4 text-center">
                    {formattedDate}
                </Text>
                <View className="flex-1 items-center justify-center ">
                        <DateTimePicker
                            value={date}
                            onChange={handleDateChange}
                            display="spinner"
                            mode='date'
                            textColor="black"
                        />

                </View>

                <TouchableOpacity
                    className="w-full h-14 rounded-full items-center justify-center mb-4"
                    style={{ backgroundColor: colors.primary }}
                    onPress={() => onContinue(date)}
                >
                    <Text className="text-lg font-semibold" style={{ color: colors.background }}>
                        Continuer
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
