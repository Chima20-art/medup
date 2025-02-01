import { router } from "expo-router";
import OnboardingImage1 from "@/assets/images/onboarding-1.svg";
import OnboardingImage2 from "@/assets/images/onboarding-2.svg";
import OnboardingImage3 from "@/assets/images/onboarding-3.svg";
import {
  Text,
  View,
  Dimensions,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import {LinearGradient} from "expo-linear-gradient";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const onboardingData = [
  {
    title: "Simplifiez votre suivi médical",
    description: (
      <Text className="font-semibold" style={{ fontFamily: "Poppins-Regular" }}>
        "Regroupez toutes vos informations de santé en un seul endroit,
        accessible facilement et à tout moment."
      </Text>
    ),
    Image: OnboardingImage1,
    backgroundColor: "#fff",
  },
  {
    title: "Gardez un œil \nsur vos examens",
    description: (
      <Text
        className="font-semibold "
        style={{ fontFamily: "Poppins-Regular" }}
      >
        "Suivez vos{" "}
        <Text className="font-extrabold">
          analyses biologiques, radiologiques
        </Text>{" "}
        et vos <Text className="font-extrabold">consultations</Text> pour une
        meilleure prise en charge."
      </Text>
    ),
    Image: OnboardingImage2,
    backgroundColor: "#fff",
  },
  {
    title: "Prenez soin de votre santé en toute simplicité",
    description: (
      <Text className="font-semibold" style={{ fontFamily: "Poppins-Regular" }}>
        "Accédez à vos {"\n"}{" "}
        <Text className="font-extrabold">prescriptions</Text>, suivez vos{" "}
        <Text className="font-extrabold">constantes vitales</Text> et ne manquez
        aucune {"\n"} information essentielle."
      </Text>
    ),
    Image: OnboardingImage3,
    backgroundColor: "#fff",
  },
];

export default function Onboarding() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const [isScrollingToSignIn, setIsScrollingToSignIn] = useState(false);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / SCREEN_WIDTH);

    if (
      newIndex !== currentIndex &&
      newIndex >= 0 &&
      newIndex < onboardingData.length
    ) {
      setCurrentIndex(newIndex);
    }

    // Check if we've scrolled past the last slide
    if (contentOffsetX > SCREEN_WIDTH * (onboardingData.length - 0.5)) {
      setIsScrollingToSignIn(true);
    }
  };

  const handleMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / SCREEN_WIDTH);

    if (newIndex >= 0 && newIndex < onboardingData.length) {
      setCurrentIndex(newIndex);
      scrollViewRef.current?.scrollTo({
        x: newIndex * SCREEN_WIDTH,
        animated: true,
      });
    } else if (newIndex >= onboardingData.length) {
      setIsScrollingToSignIn(true);
    }
  };

  useEffect(() => {
    if (isScrollingToSignIn) {
      // Redirect to sign-in page
      router.push("/sign-in");
    }
  }, [isScrollingToSignIn]);

  const handleDotPress = (index: number) => {
    setCurrentIndex(index);
    scrollViewRef.current?.scrollTo({
      x: SCREEN_WIDTH * index,
      animated: true,
    });
  };

  return (
      <LinearGradient
          colors={["#407BFF", "#264A99"]} // Light blue to dark blue
          className="flex-1"
      >
        <SafeAreaView>
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
              contentContainerStyle={{
                width: SCREEN_WIDTH * (onboardingData.length + 1),
              }}
          >
            {onboardingData.map((step, index) => (
                <View
                    key={index}
                    style={{
                      width: SCREEN_WIDTH,
                      //height: SCREEN_HEIGHT,
                    }}
                    className=" h-full"
                >
                    <View className="flex-1 content flex flex-col justify-between">
                      <View className="pt-6  px-6 mb-2">
                        <Text className="text-white text-[42px] font-extrabold leading-tight">
                          {step.title}
                        </Text>
                      </View>

                      <View className="items-center justify-center mb-6 ">
                        <step.Image
                            width={SCREEN_WIDTH * 0.8}
                            height={SCREEN_HEIGHT * 0.4}
                        />
                      </View>

                      <View className="px-6 pl-8 ">
                        <Text className="text-white text-2xl w-[90%] flex-col justify-end justify-items-end text-end opacity-90 leading-9">
                          {step.description}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row justify-center gap-x-3 my-5">
                      {onboardingData.map((_, dotIndex) => (
                          <TouchableOpacity
                              key={dotIndex}
                              onPress={() => handleDotPress(dotIndex)}
                          >
                            <View
                                className={`h-3 w-3 rounded-full ${
                                    currentIndex === dotIndex
                                        ? "bg-white"
                                        : "bg-gray-100/30"
                                }`}
                            />
                          </TouchableOpacity>
                      ))}
                    </View>
                </View>
            ))}
            {/* Empty view for detecting scroll past last slide */}
            <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }} />
          </ScrollView>
        </SafeAreaView>

      </LinearGradient>
  );
}
