import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo'
import { Link, router } from 'expo-router'
import {Text, View, Image, Pressable, useColorScheme} from 'react-native'
import { useEffect } from "react"

export default function Page() {
    const { user } = useUser()
    const colorScheme = useColorScheme()

    useEffect(() => {
        if(user){
            router.push("/dashboard")
        }
    }, [user, router]);

    return (
        <View className={`flex-1 ${colorScheme === 'dark' ? 'bg-black' : 'bg-white'}`}>
            <View className="w-full h-2/5 justify-center items-center">
                <Image
                    source={require('@/assets/images/Logo.png')}
                    className="w-4/5 h-4/5"
                    resizeMode="contain"
                />
            </View>

            <View className="flex-1 justify-between px-5 pb-10">
                <View className="items-center mb-10">
                    <Text className={`text-3xl font-bold mb-4 text-center ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>
                        Hi, I'm MEDup
                    </Text>
                    <Text className={`text-lg text-center ${colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        The #1 app to track your health data and boost your well-being.
                    </Text>
                </View>

                <SignedOut>
                    <View className="flex flex-col gap-y-4 w-[90%] mx-auto">
                        <Link href="/sign-up" asChild>
                            <Pressable className="bg-primary py-4 rounded-xl items-center">
                                <Text className="text-secondary font-medium text-lg">Create a new user</Text>
                            </Pressable>
                        </Link>
                        <Link href="/sign-in" asChild>
                            <Pressable className="bg-primary py-4 rounded-xl items-center">
                                <Text className="text-secondary font-medium text-lg">Log in as an existing user</Text>
                            </Pressable>
                        </Link>
                    </View>
                </SignedOut>
            </View>
        </View>
    )
}