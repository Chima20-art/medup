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
import {Bold} from "lucide-react-native";

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
        backgroundColor: '#4F46E5'
    },
    {
        title:  (
            <Text style={{ fontFamily: 'Poppins-Regular' }}>
                Gardez un œil {"\n"} sur vos examens
            </Text>
        ),
        description: (
            <Text className="font-semibold text-right" style={{ fontFamily: 'Poppins-Regular' }}>
                "Suivez vos  <Text className="font-extrabold"> analyses biologiques, radiologiques</Text> et vos <Text className="font-extrabold">consultations</Text> pour une meilleure prise en charge."
            </Text>
        ),
        Image: OnboardingImage2,
        backgroundColor: '#818CF8'
    },
    {
        title: "Prenez soin de votre santé en toute simplicité",
        description: (
            <Text className="font-semibold" style={{ fontFamily: 'Poppins-Regular' }}>
                "Accédez à vos {"\n"} <Text className="font-extrabold">prescriptions</Text>, suivez vos <Text className="font-extrabold">constantes vitales</Text> et ne manquez aucune {"\n"} information essentielle."
            </Text>
        ),
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
                      <View className="flex-1">
                          <View className="pt-16 px-6 mb-2">
                              <Text className="text-white text-[46px] font-extrabold leading-tight">
                                  {step.title}
                              </Text>
                          </View>

                          {/* Centered Image */}
                          <View className=" items-center justify-center mb-6">
                              <step.Image
                                  width={SCREEN_WIDTH * 0.87}
                                  height={SCREEN_HEIGHT * 0.4}
                              />
                          </View>
                      </View>

                        {/* Description at the bottom */}
                        <View className="px-6 pl-8 mb-20">
                            <Text className="text-white text-2xl w-[90%] flex-col justify-end justify-items-end text-end opacity-90 leading-9">
                                {step.description}
                            </Text>
                        </View>

                        {/* Dots at the bottom */}
                        <View className="absolute bottom-12 left-0 right-0">
                            <View className="flex-row justify-center gap-x-3">
                                {onboardingData.map((_, dotIndex) => (
                                    <TouchableOpacity
                                        key={dotIndex}
                                        onPress={() => handleDotPress(dotIndex)}
                                    >
                                        <View
                                            className={`h-3 w-3 rounded-full ${
                                                currentIndex === dotIndex
                                                    ? 'bg-blue-900'
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

