import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import React from "react";
import {View, Text, Button, TouchableOpacity, TextInput} from "react-native";
import {ChevronLeft, Search} from "lucide-react-native";
import RadioCategory from "@/assets/images/radioCategory.svg";

export default function More() {
  const router = useRouter();
  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/sign-in");
  };

  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-2xl font-bold">More Page</Text>
      <Button title="Sign Out" onPress={signOut} />
        {/*<View className="bg-white px-2 pb-4">*/}
        {/*    <View className="flex-row items-center justify-between mb-2">*/}
        {/*        <View className="flex-1 mr-2">*/}
        {/*            <View className="flex-row items-start">*/}
        {/*                <TouchableOpacity*/}
        {/*                    onPress={() => router.back()}*/}
        {/*                    className="w-10 h-10 items-center justify-center rounded-full"*/}
        {/*                >*/}
        {/*                    <ChevronLeft size={24} color="#4F46E5" />*/}
        {/*                </TouchableOpacity>*/}
        {/*                <View className="flex-col items-center mr-2">*/}
        {/*                    <Text className="text-primary-500 text-3xl font-bold">*/}
        {/*                        Mes examens*/}
        {/*                    </Text>*/}
        {/*                    <Text className="text-primary-500 text-3xl font-bold ml-1">*/}
        {/*                        radiologiques*/}
        {/*                    </Text>*/}
        {/*                </View>*/}
        {/*            </View>*/}
        {/*        </View>*/}
        {/*        <RadioCategory className="" />*/}
        {/*    </View>*/}

        {/*    /!* Search Bar *!/*/}
        {/*    <View className="flex-row items-center bg-gray-100 rounded-xl px-4 h-12 mt-2">*/}
        {/*        <Search size={20} color="#9CA3AF" />*/}
        {/*        <TextInput*/}
        {/*            value={searchQuery}*/}
        {/*            onChangeText={setSearchQuery}*/}
        {/*            placeholder="Recherche"*/}
        {/*            className="flex-1 ml-3 text-base"*/}
        {/*            placeholderTextColor="#9CA3AF"*/}
        {/*        />*/}
        {/*    </View>        */}

        {/*</View>    */}

    </View>
  );
}
