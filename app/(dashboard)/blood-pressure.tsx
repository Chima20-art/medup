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
import { ChevronLeft, Activity, Plus, Trash2 } from "lucide-react-native";
import { LineChart } from "react-native-chart-kit";
import { Swipeable } from "react-native-gesture-handler";

export default function BloodPressure() {
  const router = useRouter();
  const [date, setDate] = useState(new Date());
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [isEnteringSystolic, setIsEnteringSystolic] = useState(true);
  const [values, setValues] = useState<
      {
        id: number;
        date: Date;
        systolic: string;
        diastolic: string;
        createdAt: string;
      }[]
  >([]);
  const [showAddValue, setShowAddValue] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const bpAnimation = useRef(new Animated.Value(1)).current;

  // Animate blood pressure icon
  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(bpAnimation, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(bpAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => setTimeout(animate, 2000));
    };
    animate();
  }, []);

  const fetchValues = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
          .from("blood pressure")
          .select()
          .order("date", { ascending: false });
      if (error) throw error;
      setValues(data || []);
    } catch (error) {
      console.error("Error fetching blood pressure values:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchValues();
  }, []);

  const handleNumberPress = (num: string) => {
    if (isEnteringSystolic) {
      if (systolic.length < 3) {
        setSystolic(systolic + num);
        if (systolic.length === 2) {
          setIsEnteringSystolic(false);
        }
      }
    } else {
      if (diastolic.length < 3) {
        setDiastolic(diastolic + num);
      }
    }
  };

  const handleDeletePress = () => {
    if (!isEnteringSystolic && diastolic === "") {
      setIsEnteringSystolic(true);
    } else if (isEnteringSystolic) {
      setSystolic(systolic.slice(0, -1));
    } else {
      setDiastolic(diastolic.slice(0, -1));
    }
  };

  const handleDone = async () => {
    if (isEnteringSystolic) {
      setIsEnteringSystolic(false);
      return;
    }

    try {
      const { error } = await supabase
          .from("blood pressure")
          .insert({ date, systolic, diastolic });
      if (error) throw error;
      await fetchValues();
    } catch (error) {
      console.error("Error saving blood pressure value:", error);
    } finally {
      setShowAddValue(false);
      setSystolic("");
      setDiastolic("");
      setIsEnteringSystolic(true);
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
                    .from("blood pressure")
                    .delete()
                    .eq("id", id);
                if (error) throw error;
                await fetchValues();
              } catch (error) {
                console.error("Error deleting blood pressure value:", error);
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
      datasets: [
        {
          data: sortedValues.slice(-5).map(v => Number(v.systolic)),
          color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
          strokeWidth: 2
        },
        {
          data: sortedValues.slice(-5).map(v => Number(v.diastolic)),
          color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
          strokeWidth: 2
        }
      ]
    };
  };

  if (showAddValue) {
    return (
        <MetricInputTemplate
            title="Tension artérielle"
            value={isEnteringSystolic ? systolic : diastolic}
            date={date}
            onDateChange={(event: any, selectedDate: any) => {
              if (selectedDate) setDate(selectedDate);
            }}
            onDateConfirm={(selectedDate: Date) => setDate(selectedDate)}
            onNumberPress={handleNumberPress}
            onDeletePress={handleDeletePress}
            onDonePress={handleDone}
            unit={isEnteringSystolic ? "systolique" : "diastolique"}
            secondaryValue={isEnteringSystolic ? "" : systolic}
            secondaryUnit={isEnteringSystolic ? "" : "systolique"}
        />
    );
  }

  const EmptyState = () => (
      <View className="flex-1 items-center justify-center p-6">
        <Animated.View style={{ transform: [{ scale: bpAnimation }] }}>
          <Activity size={64} color="#6366f1" />
        </Animated.View>
        <Text className="text-xl font-semibold text-gray-800 mt-6 text-center">
          Aucune mesure de tension artérielle
        </Text>
        <Text className="text-gray-500 text-center mt-2 mb-6">
          Commencez à suivre votre tension artérielle en ajoutant votre première mesure
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
              {item.systolic}/{item.diastolic} mmHg
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
            <Text className="text-2xl font-bold text-gray-800">Tension artérielle</Text>
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
                              transform: [{ scale: bpAnimation }],
                              alignItems: 'center'
                            }}
                        >
                          <Activity size={36} color="#ef4444" />
                        </Animated.View>
                        <View className="items-center mt-6 py-6">
                          <View className="flex-row items-end">
                            <Text className="text-4xl font-bold text-gray-800">
                              {values[0]?.systolic}/{values[0]?.diastolic}
                            </Text>
                            <Text className="text-xl text-gray-500"> mmHg</Text>
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

