import React from 'react'
import { View, ActivityIndicator } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'

export function LoadingSpinner() {
    return (
        <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            className="flex-1 justify-center items-center"
        >
            <ActivityIndicator size="large" color="#6366f1" />
        </Animated.View>
    )
}

