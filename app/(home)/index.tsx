import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo'
import { Link, router } from 'expo-router'
import { Text, View, Image, TouchableOpacity, useColorScheme } from 'react-native'
import { useEffect, useState } from "react"
import {useTheme} from "@react-navigation/native";

export default function Page() {
    const { user } = useUser();
    const colorScheme = useColorScheme();
    const [isMounted, setIsMounted] = useState(false);
    const { colors } = useTheme()

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isMounted && user) {
            router.push("/dashboard");
        }
    }, [isMounted, user]);

    return (
        <View className="flex-1 bg-[#f0f2f5]">
            <View className="w-full h-2/5 justify-center items-center mt-16">
                <Image
                    source={require('@/assets/images/Logo.png')}
                    className="w-4/5 h-4/5"
                    resizeMode="contain"
                />
            </View>

            <View className="flex-1 justify-between px-10 pb-10">
                <View className="items-center mb-10">
                    <Text className="text-3xl font-bold mb-4 text-center text-[#333]">
                        Bonjour, je suis MEDup
                    </Text>
                    <Text className="text-lg text-center text-[#666]">
                        L'application n°1 pour suivre vos données de santé et améliorer votre bien-être.
                    </Text>
                </View>

                <SignedOut>
                    <View className="flex flex-col gap-y-4 w-full mb-10">
                        <Link href="/sign-up" asChild>
                            <TouchableOpacity style={{ backgroundColor: colors.primary }} className="w-full h-14 rounded-full items-center justify-center">
                                <Text className="text-white text-lg font-semibold">
                                    Créer un nouveau compte
                                </Text>
                            </TouchableOpacity>
                        </Link>
                        <Link href="/sign-in" asChild>
                            <TouchableOpacity className="w-full h-14 bg-white border border-[#000] rounded-full items-center justify-center">
                                <Text  style={{ color: colors.primary }} className="text-lg font-semibold">
                                    Se connecter
                                </Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </SignedOut>
            </View>
        </View>
    )
}