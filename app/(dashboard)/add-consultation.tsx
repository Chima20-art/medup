import { router } from 'expo-router'
import OnboardingImage1 from '@/assets/images/onboarding-1.svg'
import OnboardingImage2 from '@/assets/images/onboarding-2.svg'
import OnboardingImage3 from '@/assets/images/onboarding-3.svg'
import {
    Text,
    View,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    NativeSyntheticEvent,
    NativeScrollEvent,
    StatusBar
} from 'react-native'
import { useState, useRef } from "react"
import { ChevronRight } from "lucide-react-native"

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

    const handleNext = () => {
        if (currentIndex < onboardingData.length - 1) {
            const nextIndex = currentIndex + 1
            setCurrentIndex(nextIndex)
            scrollViewRef.current?.scrollTo({ x: SCREEN_WIDTH * nextIndex, animated: true })
        } else {
            router.push("/sign-in")
        }
    }

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x
        const newIndex = Math.floor(contentOffsetX / SCREEN_WIDTH)
        if (newIndex >= 0 && newIndex < onboardingData.length) {
            setCurrentIndex(newIndex)
        }
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
                        className="flex-1 px-6 pt-12"
                    >
                        <View className="flex-1 items-center justify-center">
                            <Text className="text-white text-3xl font-bold text-center mb-4 px-4">
                                {step.title}
                            </Text>
                            <View className="w-full items-center justify-center flex-1 max-h-[50%]">
                                <step.Image width={SCREEN_WIDTH * 0.8} height={SCREEN_HEIGHT * 0.35} />
                            </View>
                            <Text className="text-white text-center text-base px-4 opacity-90">
                                {step.description}
                            </Text>
                        </View>

                        {/* Bottom Navigation */}
                        <View className="pb-12 items-center">
                            {/* Progress Dots */}
                            <View className="flex-row justify-center space-x-2 mb-8">
                                {onboardingData.map((_, dotIndex) => (
                                    <View
                                        key={dotIndex}
                                        className={`h-2 w-2 rounded-full ${
                                            currentIndex === dotIndex
                                                ? 'bg-white'
                                                : 'bg-white/30'
                                        }`}
                                    />
                                ))}
                            </View>

                            {/* Next Button */}
                            <TouchableOpacity
                                onPress={handleNext}
                                className="bg-white/20 rounded-full px-12 py-4"
                            >
                                <Text className="text-white text-lg font-medium">
                                    {currentIndex === onboardingData.length - 1 ? 'Commencer' : 'Suivant'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    )
}

