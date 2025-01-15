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
    TouchableOpacity,
    SafeAreaView
} from 'react-native'
import { useState, useRef, useEffect } from "react"

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

const onboardingData = [
    {
        title: "Simplifiez votre suivi médical",
        description: (
            <Text className="font-semibold" style={{ fontFamily: 'Poppins-Regular' }}>
                "Regroupez toutes vos informations de santé en un seul endroit, accessible facilement et à tout moment."
            </Text>
        ),
        Image: OnboardingImage1,
        backgroundColor: '#fff'
    },
    {
        title: "Gardez un œil \nsur vos examens",
        description: (
            <Text className="font-semibold text-right" style={{ fontFamily: 'Poppins-Regular' }}>
                "Suivez vos  <Text className="font-extrabold"> analyses biologiques, radiologiques</Text> et vos <Text className="font-extrabold">consultations</Text> pour une meilleure prise en charge."
            </Text>
        ),
        Image: OnboardingImage2,
        backgroundColor: '#fff'
    },
    {
        title: "Prenez soin de votre santé en toute simplicité",
        description: (
            <Text className="font-semibold" style={{ fontFamily: 'Poppins-Regular' }}>
                "Accédez à vos {"\n"} <Text className="font-extrabold">prescriptions</Text>, suivez vos <Text className="font-extrabold">constantes vitales</Text> et ne manquez aucune {"\n"} information essentielle."
            </Text>
        ),
        Image: OnboardingImage3,
        backgroundColor: '#fff'
    }
]

export default function Onboarding() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const scrollViewRef = useRef<ScrollView>(null)
    const [isScrollingToSignIn, setIsScrollingToSignIn] = useState(false)

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x
        const newIndex = Math.round(contentOffsetX / SCREEN_WIDTH)

        if (newIndex !== currentIndex && newIndex >= 0 && newIndex < onboardingData.length) {
            setCurrentIndex(newIndex)
        }

        // Check if we've scrolled past the last slide
        if (contentOffsetX > SCREEN_WIDTH * (onboardingData.length - 0.5)) {
            setIsScrollingToSignIn(true)
        }
    }

    const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x
        const newIndex = Math.round(contentOffsetX / SCREEN_WIDTH)

        if (newIndex >= 0 && newIndex < onboardingData.length) {
            setCurrentIndex(newIndex)
            scrollViewRef.current?.scrollTo({ x: newIndex * SCREEN_WIDTH, animated: true })
        } else if (newIndex >= onboardingData.length) {
            setIsScrollingToSignIn(true)
        }
    }

    useEffect(() => {
        if (isScrollingToSignIn) {
            // Redirect to sign-in page
            router.push('/sign-in')
        }
    }, [isScrollingToSignIn])

    const handleDotPress = (index: number) => {
        setCurrentIndex(index)
        scrollViewRef.current?.scrollTo({ x: SCREEN_WIDTH * index, animated: true })
    }

    return (
        <SafeAreaView className="flex-1">
            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                onMomentumScrollEnd={handleMomentumScrollEnd}
                scrollEventThrottle={16}
                decelerationRate="fast"
                snapToInterval={SCREEN_WIDTH}
                snapToAlignment="center"
                contentContainerStyle={{ width: SCREEN_WIDTH * (onboardingData.length + 1) }}
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
                        <View className="flex-1 justify-between flex-col">
                            <View className="pt-16 px-6 mb-2">
                                <Text className="text-primary-500 text-[46px] font-extrabold leading-tight">
                                    {step.title}
                                </Text>
                            </View>

                            <View className="items-center justify-center mb-6">
                                <step.Image
                                    width={SCREEN_WIDTH * 0.87}
                                    height={SCREEN_HEIGHT * 0.4}
                                />
                            </View>
                        </View>

                        <View className="px-6 pl-8 mb-20">
                            <Text className="text-primary-500 text-2xl w-[90%] flex-col justify-end justify-items-end text-end opacity-90 leading-9">
                                {step.description}
                            </Text>
                        </View>

                        <View className="absolute bottom-20 left-0 right-0">
                            <View className="flex-row justify-center gap-x-3">
                                {onboardingData.map((_, dotIndex) => (
                                    <TouchableOpacity
                                        key={dotIndex}
                                        onPress={() => handleDotPress(dotIndex)}
                                    >
                                        <View
                                            className={`h-3 w-3 rounded-full ${
                                                currentIndex === dotIndex
                                                    ? 'bg-blue-800'
                                                    : 'bg-gray-600/30'
                                            }`}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>
                ))}
                {/* Empty view for detecting scroll past last slide */}
                <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }} />
            </ScrollView>
        </SafeAreaView>
    )
}

