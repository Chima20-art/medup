import { router } from 'expo-router'
import OnboardingImage1 from '@/assets/images/onboarding-1.svg'
import OnboardingImage2 from '@/assets/images/onboarding-2.svg'
import OnboardingImage3 from '@/assets/images/onboarding-3.svg'
import {
    Text,
    View,
    Dimensions,
    ScrollView,
    NativeSyntheticEvent,
    NativeScrollEvent,
    StatusBar,
    TouchableOpacity
} from 'react-native'
import { useState, useRef } from "react"

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

const onboardingData = [
    {
        title: "Simplifiez votre suivi médical",
        description: "Regroupez toutes vos informations de santé en un seul endroit, accessibles facilement et à tout moment.",
        Image: OnboardingImage1,
        backgroundColor: '#4F46E5'
    },
    {
        title: "Gardez un œil sur vos examens",
        description: "Suivez vos analyses biologiques, radiologiques et vos consultations pour une meilleure prise en charge.",
        Image: OnboardingImage2,
        backgroundColor: '#818CF8'
    },
    {
        title: "Prenez soin de votre santé en toute simplicité",
        description: "Accédez à vos prescriptions suivant vos constantes vitales et ne manquez aucune information essentielle.",
        Image: OnboardingImage3,
        backgroundColor: '#06B6D4'
    }
]

export default function Onboarding() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const scrollViewRef = useRef<ScrollView>(null)

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x
        const newIndex = Math.floor(contentOffsetX / SCREEN_WIDTH)
        if (newIndex >= 0 && newIndex < onboardingData.length) {
            setCurrentIndex(newIndex)
        }
        if (newIndex === onboardingData.length - 1 && contentOffsetX > SCREEN_WIDTH * (onboardingData.length - 1)) {
            router.push('/sign-in') // Replace '/sign-in' with your actual sign-in route
        }
    }

    const handleDotPress = (index: number) => {
        setCurrentIndex(index)
        scrollViewRef.current?.scrollTo({ x: SCREEN_WIDTH * index, animated: true })
    }

    return (
        <View className="flex-1">
            <StatusBar barStyle="light-content" />
            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                onMomentumScrollEnd={handleScroll}
            >
                {onboardingData.map((step, index) => (
                    <View
                        key={index}
                        style={{
                            width: SCREEN_WIDTH,
                            height: SCREEN_HEIGHT,
                            backgroundColor: step.backgroundColor
                        }}
                        className="flex-1 py-10"
                    >
                        {/* Title at the top */}
                        <View className="pt-16 px-6 mb-2">
                            <Text className="text-white text-[46px] font-bold leading-tight">
                                {step.title}
                            </Text>
                        </View>

                        {/* Centered Image */}
                        <View className=" items-center justify-center px-6 mb-6">
                            <step.Image
                                width={SCREEN_WIDTH * 0.8}
                                height={SCREEN_HEIGHT * 0.4}
                            />
                        </View>

                        {/* Description at the bottom */}
                        <View className="px-6 mb-20">
                            <Text className="text-white text-2xl  opacity-90">
                                {step.description}
                            </Text>
                        </View>

                        {/* Dots at the bottom */}
                        <View className="absolute bottom-12 left-0 right-0">
                            <View className="flex-row justify-center gap-x-2">
                                {onboardingData.map((_, dotIndex) => (
                                    <TouchableOpacity
                                        key={dotIndex}
                                        onPress={() => handleDotPress(dotIndex)}
                                    >
                                        <View
                                            className={`h-2 w-2 rounded-full ${
                                                currentIndex === dotIndex
                                                    ? 'bg-white'
                                                    : 'bg-white/30'
                                            }`}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    )
}

