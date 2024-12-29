import React from 'react';
import {View, Text, Image, ScrollView, TouchableOpacity} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Google from "@/assets/images/google.svg";
import {Mail} from "lucide-react-native";
import Logo from "@/assets/images/logo.svg";
import {router} from "expo-router";



export default function SignUpOnboarding() {

    return (
        <SafeAreaView className="flex-1 bg-[#4F46E5]">
            <ScrollView contentContainerClassName="flex-1">
                <View className="flex-1 px-6 pt-10">
                    {/* Header */}
                    <Text className="text-white text-[56px] font-bold mb-2">
                        Welcome to{"\n"}
                        <Text className="text-[#A5B4FC]">Medup.</Text>
                    </Text>

                    {/* Main Image and Cards */}
                    <View className="flex-1 justify-center items-center relative">
                        <View className="w-fit h-fit p-4 pt-10 justify-center items-center aspect-square rounded-3xl overflow-hidden bg-white">
                            <Image source={require("@/assets/images/categories.png")}
                            />
                        </View>
                        <View className="absolute -top-2 right-0 bg-white rounded-2xl shadow-xl">
                            <Logo width={200} height={100}/>
                        </View>
                    </View>

                    {/* Buttons */}
                    <View className="flex flex-column gap-y-2 mb-6">
                        <TouchableOpacity
                            className="w-full h-14 bg-black rounded-xl flex-row items-center justify-center space-x-2"
                        >
                            <Google width={20} height={20} />
                            <Text className="text-white text-base font-semibold ml-2">
                                S'inscrire avec google
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="w-full h-14 bg-white rounded-xl flex-row items-center justify-center"
                            onPress={() => router.push("/sign-up")}
                        >
                            <Mail width={20} height={20}/>
                            <Text className="text-black text-base font-semibold ml-2">
                                S'inscrire avec email
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <Text className="text-center text-white/70 text-sm mb-6">
                        By signing in you agree to our{'\n'}
                        <Text className="underline font-bold">Terms of Service</Text>
                        {' '}and{' '}
                        <Text className="underline font-bold">Privacy Policy</Text>
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

