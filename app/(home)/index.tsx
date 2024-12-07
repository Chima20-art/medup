import {  router } from 'expo-router'
import OnboardingImage1 from '@/assets/images/onboarding-1.svg';
import OnboardingImage2 from '@/assets/images/onboarding-2.svg';
import OnboardingImage3 from '@/assets/images/onboarding-3.svg';

import {
    Text,
    View,
    Image,
    TouchableOpacity,
    useColorScheme,
    Dimensions,
    ScrollView,
    NativeSyntheticEvent, NativeScrollEvent
} from 'react-native'
import { useEffect, useState, useRef } from "react"
import { useTheme } from "@react-navigation/native"
import { Animated } from 'react-native';
import Svg, {Circle} from "react-native-svg";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

const onboardingData = [
    {
        title: "Simplifiez votre suivi médical",
        description: "Regroupez toutes vos informations de santé en un seul endroit, accessibles facilement et à tout moment.",
        Image: OnboardingImage1
    },
    {
        title: "Gardez un œil sur vos examens",
        description: "Suivez vos analyses biologiques, radiologiques et vos consultations pour une meilleure prise en charge.",
        Image: OnboardingImage2
    },
    {
        title: "Prenez soin de votre santé en toute simplicité",
        description: "Accédez à vos prescriptions suivant vos constantes vitales et ne manquez aucune information essentielle.",
        Image: OnboardingImage3
    }
]

export default function Onboarding() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const scrollViewRef = useRef<ScrollView>(null)
    const progressAnimation = useRef(new Animated.Value(0)).current
    const { colors } = useTheme()

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

    useEffect(() => {
        Animated.timing(progressAnimation, {
            toValue: (currentIndex + 1) / onboardingData.length,
            duration: 300,
            useNativeDriver: true,
        }).start()
    }, [currentIndex])

    const circumference = 2 * Math.PI * 40 // radius is 40
    const AnimatedCircle = Animated.createAnimatedComponent(Circle)

    return (
        <View className="flex-1 bg-white">
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
                    <View key={index} style={{ width: SCREEN_WIDTH }} className="flex flex-col justify-items-end justify-end flex-1 px-10 py-16">
                        <View className="w-full mt-16">
                            <step.Image width={SCREEN_WIDTH * 0.8} height={SCREEN_HEIGHT * 0.3}/>
                        </View>
                        <View className="mt-10">
                        <Text className="font-bold text-2xl mb-4 text-center text-[#333]">
                                {step.title}
                            </Text>
                            <Text className="font-sans text-center text-[#666]">
                                {step.description}
                            </Text>
                        </View>
                    </View>
                ))}
            </ScrollView>

            <View className="flex-row justify-center mb-8">
                {onboardingData.map((_, index) => (
                    <View
                        key={index}
                        className={`h-2 w-2 rounded-full mx-1 ${
                            currentIndex === index ? 'bg-[#0000FF]' : 'bg-[#CCCCCC]'
                        }`}
                    />
                ))}
            </View>

            <View className="px-8 mb-10">
                <TouchableOpacity
                    onPress={handleNext}
                    className="w-28 h-28 items-center justify-center self-end relative"
                >
                    <Svg width={112} height={112} style={{ position: 'absolute' }}>
                        {/* Background circle */}
                        <Circle
                            cx={56}
                            cy={56}
                            r={36}
                            stroke="#E5E7EB"
                            strokeWidth={3}
                            fill="none"
                        />
                        <AnimatedCircle
                            cx={56}
                            cy={56}
                            r={36}
                            stroke={colors.primary}
                            strokeWidth={3}
                            fill="none"
                            strokeDasharray={circumference}
                            strokeDashoffset={Animated.multiply(
                                Animated.subtract(1, progressAnimation),
                                circumference
                            )}
                            transform={`rotate(-90 56 56)`}
                            strokeLinecap="round"
                        />
                    </Svg>
                    <View style={{ backgroundColor: colors.primary }} className="w-14 h-14 rounded-full items-center justify-center">
                        <Text className="text-white text-2xl">→</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    )
}