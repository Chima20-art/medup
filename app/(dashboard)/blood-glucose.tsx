import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "expo-router";
import MetricInputTemplate from "@/components/metricInputLayout";
import { supabase } from "@/utils/supabase";
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
} from "react-native";
import { ChevronLeft, Droplet, Plus, Trash2 } from "lucide-react-native";
import { LineChart } from "react-native-chart-kit";
import { Swipeable } from "react-native-gesture-handler";

export default function BloodGlucose() {
  const router = useRouter();
  const [date, setDate] = useState(new Date());
  const [value, setValue] = useState("");
  const [values, setValues] = useState<
      {
        id: number;
        date: Date;
        value: string;
        createdAt: string;
      }[]
  >([]);
  const [showAddValue, setShowAddValue] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dropletAnimation = useRef(new Animated.Value(1)).current;

  // Animate droplet
  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(dropletAnimation, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(dropletAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => setTimeout(animate, 1500));
    };
    animate();
  }, []);

  const fetchValues = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
          .from("blood glucose")
          .select()
          .order("date", { ascending: false });
      if (error) throw error;
      setValues(data || []);
    } catch (error) {
      console.error("Error fetching blood glucose values:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchValues();
  }, []);

  const handleNumberPress = (num: string) => {
    if (num === "." && value.includes(".")) return;
    if (value.includes(".") && value.split(".")[1].length >= 2) return;
    setValue(value + num);
  };

  const handleDeletePress = () => {
    setValue(value.slice(0, -1));
  };

  const handleDone = async () => {
    try {
      const { error } = await supabase
          .from("blood glucose")
          .insert({ date, value });
      if (error) throw error;
      await fetchValues();
    } catch (error) {
      console.error("Error saving blood glucose value:", error);
    } finally {
      setShowAddValue(false);
    }
  };

  const handleDelete = async (id: number) => {
    Alert.alert(
        "Supprimer la mesure",
        "Êtes-vous sûr de vouloir supprimer cette mesure ?",
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Supprimer",
            style: "destructive",
            onPress: async () => {
              try {
                const { error } = await supabase
                    .from("blood glucose")
                    .delete()
                    .eq("id", id);
                if (error) throw error;
                await fetchValues();
              } catch (error) {
                console.error("Error deleting blood glucose value:", error);
              }
            },
          },
        ]
    );
  };

  const getChartData = () => {
    const sortedValues = [...values].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    return {
      labels: sortedValues.slice(-5).map(v =>
          new Date(v.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
      ),
      datasets: [{
        data: sortedValues.slice(-5).map(v => Number(v.value))
      }]
    };
  };

  if (showAddValue) {
    return (
        <MetricInputTemplate
            title="Glycémie"
            value={value}
            date={date}
            onDateChange={(event: any, selectedDate: any) => {
              if (selectedDate) setDate(selectedDate);
            }}
            onDateConfirm={(selectedDate: Date) => setDate(selectedDate)}
            onNumberPress={handleNumberPress}
            onDeletePress={handleDeletePress}
            onDonePress={handleDone}
            unit="mmol/L"
        />
    );
  }

  const EmptyState = () => (
      <View className="flex-1 items-center justify-center p-6">
        <Animated.View style={{ transform: [{ scale: dropletAnimation }] }}>
          <Droplet size={64} color="#6366f1" />
        </Animated.View>
        <Text className="text-xl font-semibold text-gray-800 mt-6 text-center">
          Aucune mesure de glycémie
        </Text>
        <Text className="text-gray-500 text-center mt-2 mb-6">
          Commencez à suivre votre glycémie en ajoutant votre première mesure
        </Text>
        <TouchableOpacity
            onPress={() => setShowAddValue(true)}
            className="bg-indigo-500 px-6 py-3 rounded-full flex-row items-center"
        >
          <Plus size={20} color="white" />
          <Text className="text-white font-semibold ml-2">Ajouter une mesure</Text>
        </TouchableOpacity>
      </View>
  );

  const renderItem = ({ item }) => (
      <Swipeable
          renderRightActions={(progress, dragX) => {
            const scale = dragX.interpolate({
              inputRange: [-100, 0],
              outputRange: [1, 0],
              extrapolate: 'clamp',
            });
            return (
                <TouchableOpacity
                    onPress={() => handleDelete(item.id)}
                    className="bg-red-500 justify-center items-center px-4"
                >
                  <Animated.View style={{ transform: [{ scale }] }}>
                    <Trash2 size={24} color="white" />
                  </Animated.View>
                </TouchableOpacity>
            );
          }}
      >
        <TouchableOpacity
            className="mx-4 mb-2 p-4 bg-white rounded-xl flex-row justify-between items-center"
            onPress={() => {}}
        >
          <View>
            <Text className="text-lg font-semibold text-gray-800">
              {item.value} mmol/L
            </Text>
            <Text className="text-sm text-gray-500">
              {new Date(item.date).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
          <View className="w-2 h-2 rounded-full bg-indigo-500" />
        </TouchableOpacity>
      </Swipeable>
  );

  return (
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="px-6 pt-14 pb-4 bg-white shadow-sm">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
            >
              <ChevronLeft size={34} color="#4F46E5" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-gray-800">Glucose sanguin</Text>
            <TouchableOpacity
                onPress={() => setShowAddValue(true)}
                className="w-10 h-10 items-center justify-center rounded-full bg-indigo-500"
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
                              transform: [{ scale: dropletAnimation }],
                              alignItems: 'center'
                            }}
                        >
                          <Droplet size={36} color="#ef4444" />
                        </Animated.View>
                        <View className="items-center mt-6 py-6">
                          <View className="flex-row items-end">
                            <Text className="text-4xl font-bold text-gray-800">
                              {values[0]?.value}
                            </Text>
                            <Text className="text-xl text-gray-500"> mmol/L</Text>
                          </View>
                          <Text className="text-gray-500 mt-2">
                            {new Date(values[0]?.date).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Text>
                        </View>
                      </View>

                      {/* Chart Card */}
                      {values.length > 1 && (
                          <View className="mx-4 mb-4 p-4 bg-white rounded-2xl shadow-md">
                            <Text className="text-lg font-semibold text-gray-800 mb-4">Tendance</Text>
                            <LineChart
                                data={getChartData()}
                                width={Dimensions.get('window').width - 48}
                                height={180}
                                chartConfig={{
                                  backgroundColor: '#ffffff',
                                  backgroundGradientFrom: '#ffffff',
                                  backgroundGradientTo: '#ffffff',
                                  decimalPlaces: 1,
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

                      <Text className="px-4 py-2 text-sm font-semibold text-gray-500 uppercase">
                        Historique
                      </Text>
                    </>
                )}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        )}
      </SafeAreaView>
  );
}

