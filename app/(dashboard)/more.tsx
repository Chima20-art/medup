import React, { useEffect, useState } from "react"
import { View, Text, TouchableOpacity, ScrollView, Alert, SafeAreaView } from "react-native"
import { useRouter } from "expo-router"
import { supabase } from "@/utils/supabase"
import { ChevronLeft, LogOut, User, Mail, Phone, Edit, ChevronRight } from "lucide-react-native"
import { avatars, DefaultAvatar, type AvatarType } from "@/constants/avatars"
import { useTheme } from "@react-navigation/native"

export default function More() {
    const router = useRouter()
    const [username, setUsername] = useState<string>("Utilisateur")
    const [email, setEmail] = useState<string>("")
    const [phone, setPhone] = useState<string>("")
    const [currentAvatarId, setCurrentAvatarId] = useState<number | null>(null)
    const { colors } = useTheme()

    useEffect(() => {
        fetchUserData()
    }, [])

    const fetchUserData = async () => {
        try {
            const {
                data: { user },
                error,
            } = await supabase.auth.getUser()
            if (error) throw error

            if (user) {
                setEmail(user.email || "")
                if (user.user_metadata?.displayName) {
                    setUsername(user.user_metadata.displayName)
                } else if (user.email) {
                    setUsername(user.email.split("@")[0])
                }
                setPhone(user.phone || "")
                setCurrentAvatarId(user.user_metadata?.avatarId || null)
            }
        } catch (error) {
            console.error("Error fetching user data:", error)
            Alert.alert("Erreur", "Impossible de charger les données utilisateur")
        }
    }

    const signOut = async () => {
        try {
            await supabase.auth.signOut()
            router.replace("/sign-in")
        } catch (error) {
            console.error("Error signing out:", error)
            Alert.alert("Erreur", "Impossible de se déconnecter")
        }
    }

    const AvatarComponent: AvatarType =
        currentAvatarId && avatars[currentAvatarId] ? avatars[currentAvatarId] : DefaultAvatar

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView className="flex-1">
                {/* Header */}
                <View className="p-4 flex-col">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
                    >
                        <ChevronLeft size={34} color={colors.primary} />
                    </TouchableOpacity>
                    <View className="flex-col items-center">
                        <Text className="text-[24px] mx-auto font-bold text-primary-500">Mon Profil</Text>
                        {/* Avatar and Name */}
                        <View className="items-center mt-6 mb-6">
                            <View className="bg-white p-1 rounded-full shadow-lg">
                                <AvatarComponent width={120} height={120} />
                            </View>
                        </View>
                    </View>
                </View>

                {/* User Info */}
                <View className="px-6 mb-8">
                    <TouchableOpacity
                        className="bg-white rounded-2xl shadow-sm p-4 flex-row items-center justify-between mb-4"
                        onPress={() => Alert.alert("Info", "Fonctionnalité à venir")}
                    >
                        <View className="flex-row items-center gap-x-3">
                            <User size={24} color={colors.primary} className="mr-4" />
                            <View>
                                <Text className="text-sm text-gray-500">Nom d'utilisateur</Text>
                                <Text className="text-lg font-semibold text-gray-800">{username}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="bg-white rounded-2xl shadow-sm p-4 flex-row items-center justify-between mb-4"
                        onPress={() => Alert.alert("Info", "Fonctionnalité à venir")}
                    >
                        <View className="flex-row items-center gap-x-3">
                            <Mail size={24} color={colors.primary} className="mr-4" />
                            <View>
                                <Text className="text-sm text-gray-500">Email</Text>
                                <Text className="text-lg font-semibold text-gray-800">{email}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="bg-white rounded-2xl shadow-sm p-4 flex-row items-center justify-between"
                        onPress={() => Alert.alert("Info", "Fonctionnalité à venir")}
                    >
                        <View className="flex-row items-center gap-x-3">
                            <Phone size={24} color={colors.primary} />
                            <View>
                                <Text className="text-sm text-gray-500">Téléphone</Text>
                                <Text className="text-lg font-semibold text-gray-800">{phone || "Non renseigné"}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>



                {/* Sign Out Button */}
                <View className="px-6">
                    <TouchableOpacity
                        className="border-2 border-red-500 py-3 px-6 rounded-full flex-row gap-x-2 justify-center items-center"
                        onPress={signOut}
                    >
                        <LogOut size={20} color="red" />
                        <Text className="text-red-500 font-semibold text-lg">Se déconnecter</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

