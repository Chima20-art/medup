import React, { useEffect, useCallback } from "react"
import { View, Text, Pressable } from "react-native"
import { useTheme } from "@react-navigation/native"
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from "react-native-reanimated"

export default function Categories() {
    const { colors } = useTheme()

    const pulseAnim = useSharedValue(1)

    const startAnimation = useCallback(() => {
        pulseAnim.value = withRepeat(withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }), -1, true)
    }, [pulseAnim]) // Added pulseAnim to dependencies

    useEffect(() => {
        startAnimation()
    }, [startAnimation])

    const animatedStyles = useAnimatedStyle(() => ({
        transform: [{ scale: pulseAnim.value }],
    }))

    return (
        <View className="flex-1 bg-primary-300 items-center justify-center">
            <Pressable>
                {({ pressed }) => (
                    <Animated.View style={[animatedStyles, { opacity: pressed ? 0.8 : 1 }]} className="overflow-hidden">
                        <View className="bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full p-0.5">
                            <View className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-full px-8 py-4">
                                <Text
                                    className="text-3xl font-bold"
                                    style={{
                                        color: '#ffffff',
                                    }}
                                >
                                    Coming Soon
                                </Text>
                            </View>
                        </View>
                    </Animated.View>
                )}
            </Pressable>
        </View>
    )
}