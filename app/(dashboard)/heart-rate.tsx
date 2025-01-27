import React, { useEffect, useState, useRef } from "react"
import { useRouter } from "expo-router"
import MetricInputTemplate from "@/components/metricInputLayout"
import { supabase } from "@/utils/supabase"
import {
    FlatList,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
    Animated,
    Dimensions,
    ActivityIndicator,
    Alert,
} from "react-native"
import { ChevronLeft, Heart, Plus, Trash2 } from "lucide-react-native"
import { LineChart } from "react-native-chart-kit"
import { Swipeable } from "react-native-gesture-handler"

export default function HeartRate() {
    const router = useRouter()
    const [date, setDate] = useState(new Date())
    const [value, setValue] = useState("")
    const [values, setValues] = useState<
        {
            id: number
            date: Date
            value: string
            createdAt: string
        }[]
    >([])
    const [showAddValue, setShowAddValue] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const heartbeatAnimation = useRef(new Animated.Value(1)).current

    // Animate heartbeat
    useEffect(() => {
        const animate = () => {
            Animated.sequence([
                Animated.timing(heartbeatAnimation, {
                    toValue: 1.2,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(heartbeatAnimation, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start(() => setTimeout(animate, 1500))
        }
        animate()
    }, [heartbeatAnimation])

    const fetchValues = async () => {
        setIsLoading(true)
        try {
            const { data, error } = await supabase.from("heart rate").select().order("date", { ascending: false })
            if (error) throw error
            setValues(data || [])
        } catch (error) {
            console.error("Error fetching heart rate values:", error)
            Alert.alert("Error", "Failed to fetch heart rate values. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchValues()
    }, [])

    const handleDone = async () => {
        if (!value) {
            Alert.alert("Error", "Please enter a valid heart rate value.")
            return
        }
        try {
            const { error } = await supabase.from("heart rate").insert({ date, value: Number.parseInt(value, 10) })
            if (error) throw error
            await fetchValues()
            setValue("")
            setShowAddValue(false)
        } catch (error) {
            console.error("Error saving heart rate value:", error)
            Alert.alert("Error", "Failed to save heart rate value. Please try again.")
        }
    }

    const handleDelete = async (id: number) => {
        Alert.alert("Delete Reading", "Are you sure you want to delete this reading?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        const { error } = await supabase.from("heart rate").delete().eq("id", id)
                        if (error) throw error
                        await fetchValues()
                    } catch (error) {
                        console.error("Error deleting heart rate value:", error)
                        Alert.alert("Error", "Failed to delete heart rate value. Please try again.")
                    }
                },
            },
        ])
    }

    const getChartData = () => {
        const sortedValues = [...values].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        return {
            labels: sortedValues
                .slice(-5)
                .map((v) => new Date(v.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })),
            datasets: [
                {
                    data: sortedValues.slice(-5).map((v) => Number(v.value)),
                },
            ],
        }
    }

    if (showAddValue) {
        return (
            <MetricInputTemplate
                title="Fréquence cardiaque"
                value={value}
                date={date}
                onDateChange={(event: any, selectedDate: Date | undefined) => {
                    if (selectedDate) setDate(selectedDate)
                }}
                onDateConfirm={(selectedDate: Date) => setDate(selectedDate)}
                onDonePress={handleDone}
                unit="bpm"
                onChangeValue={setValue}
            />
        )
    }

    const EmptyState = () => (
        <View className="flex-1 items-center justify-center p-6">
            <Animated.View style={{ transform: [{ scale: heartbeatAnimation }] }}>
                <Heart size={64} color="#6366f1" />
            </Animated.View>
            <Text className="text-xl font-semibold text-gray-800 mt-6 text-center">No heart rate readings yet</Text>
            <Text className="text-gray-500 text-center mt-2 mb-6">
                Start tracking your heart rate by adding your first measurement
            </Text>
            <TouchableOpacity
                onPress={() => setShowAddValue(true)}
                className="bg-primary-500 px-6 py-3 rounded-full flex-row items-center"
            >
                <Plus size={20} color="white" />
                <Text className="text-white font-semibold ml-2">Add First Reading</Text>
            </TouchableOpacity>
        </View>
    )

    const renderItem = ({ item }: { item: { id: number; value: string; date: string } }) => (
        <Swipeable
            renderRightActions={(progress, dragX) => {
                const scale = dragX.interpolate({
                    inputRange: [-100, 0],
                    outputRange: [1, 0],
                    extrapolate: "clamp",
                })
                return (
                    <TouchableOpacity
                        onPress={() => handleDelete(item.id)}
                        className="bg-red-500 justify-center items-center px-4"
                    >
                        <Animated.View style={{ transform: [{ scale }] }}>
                            <Trash2 size={24} color="white" />
                        </Animated.View>
                    </TouchableOpacity>
                )
            }}
        >
            <TouchableOpacity
                className="mx-4 mb-2 p-4 bg-white rounded-xl flex-row justify-between items-center"
                onPress={() => {}}
            >
                <View>
                    <Text className="text-lg font-semibold text-gray-800">{item.value} bpm</Text>
                    <Text className="text-sm text-gray-500">
                        {new Date(item.date).toLocaleDateString("fr-FR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </Text>
                </View>
                <View className="w-2 h-2 rounded-full bg-primary-500" />
            </TouchableOpacity>
        </Swipeable>
    )

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="px-6 pt-4 pb-4 bg-white shadow-sm">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="w-10 h-10 justify-items-start rounded-full bg-gray-100"
                        >
                            <ChevronLeft size={34} color="#4F46E5" />
                        </TouchableOpacity>
                        <Text className="text-2xl font-bold text-primary-500 ml-2">Fréquence cardiaque</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setShowAddValue(true)}
                        className="w-10 h-10 items-center justify-center rounded-full bg-primary-500"
                    >
                        <Plus size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#6366f1" />
                </View>
            ) : values.length === 0 ? (
                <EmptyState />
            ) : (
                <FlatList
                    data={values}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    ListHeaderComponent={() => (
                        <>
                            {/* Latest Reading Card */}
                            <View className="m-4 p-6 bg-white rounded-2xl shadow-md">
                                <Animated.View
                                    style={{
                                        transform: [{ scale: heartbeatAnimation }],
                                        alignItems: "center",
                                    }}
                                >
                                    <Heart size={36} color="#ef4444" />
                                </Animated.View>
                                <View className="items-center mt-6 py-6">
                                    <View className="flex-row items-end">
                                        <Text className="text-4xl font-bold text-gray-800">{values[0]?.value}</Text>
                                        <Text className="text-xl text-gray-500"> bpm</Text>
                                    </View>
                                    <Text className="text-gray-500 mt-2">
                                        {new Date(values[0]?.date).toLocaleDateString("fr-FR", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </Text>
                                </View>
                            </View>

                            {/* Chart Card */}
                            {values.length > 1 && (
                                <View className="mx-4 mb-4 p-4 bg-white rounded-2xl shadow-md">
                                    <Text className="text-lg font-semibold text-gray-800 mb-4">Tendances</Text>
                                    <LineChart
                                        data={getChartData()}
                                        width={Dimensions.get("window").width - 48}
                                        height={180}
                                        yAxisSuffix=" bpm"
                                        chartConfig={{
                                            backgroundColor: "#ffffff",
                                            backgroundGradientFrom: "#ffffff",
                                            backgroundGradientTo: "#ffffff",
                                            decimalPlaces: 0,
                                            color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
                                            style: {
                                                borderRadius: 16,
                                            },
                                        }}
                                        bezier
                                        style={{
                                            borderRadius: 16,
                                        }}
                                    />
                                </View>
                            )}

                            <Text className="px-4 py-2 text-sm font-semibold text-gray-500 uppercase">Historique</Text>
                        </>
                    )}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}
        </SafeAreaView>
    )
}

