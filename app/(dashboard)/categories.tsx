import React from 'react';
import { View, Text } from 'react-native';
import {useTheme} from "@react-navigation/native";

export default function Categories() {
    const { colors } = useTheme();

    // Create a brighter version of the primary color
    const brightPrimaryColor = colors.primary;

    return (
        <View className="flex-1 bg-white items-center justify-center">
            <View
                className="border-4 rounded-lg p-6"
                style={{
                    borderColor: brightPrimaryColor,
                    shadowColor: brightPrimaryColor,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.5,
                    shadowRadius: 10,
                    elevation: 5,
                }}
            >
                <Text
                    style={{ color: brightPrimaryColor }}
                    className="text-3xl font-bold"
                >
                    Coming Soon
                </Text>
            </View>
        </View>
    );
}

