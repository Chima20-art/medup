"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { observer, use$ } from "@legendapp/state/react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  RefreshControl,
  Alert,
  Animated,
  SafeAreaView,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { Bell, Star, Calendar, Clock, Plus } from "lucide-react-native";
import { useRouter } from "expo-router";
import RadioCategory from "@/assets/images/radioCategory.svg";
import BioCategory from "@/assets/images/bioCategory.svg";
import MedicationCategory from "@/assets/images/medicationCategory.svg";
import ConsultationCategory from "@/assets/images/consultationsCategory.svg";
import QuickAccess from "@/assets/images/QuickAcess.svg";
import { supabase } from "@/utils/supabase";
import { AvatarSelectionModal } from "@/components/avatar-selection-modal";
import { avatars, DefaultAvatar, type AvatarType } from "@/constants/avatars";
import { notificationStore$ } from "@/store/notification";
import ListConsultations from "./list-consultations";
import Doctor from "@/assets/images/doctor.svg";

// Constants
const SCREEN_WIDTH = Dimensions.get("window").width;
interface Consultation {
  id: number;
  doctorName: string;
  speciality: number;
  date: string;
  adress: string;
  city: string;
  note: string | null;
  reminder: boolean;
  nextConsultationDate: string | null;
  nextConsultationDateReminder: string | null;
  uploads: string[] | null;
  audio_notes: string[] | null;
  created_at: string;
  user_id: string;
  specialties: {
    name: string;
    hexColor: string;
  };
}

// Styles
const categoryCardStyle = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 2,
} as const;

// Categories data
const categories = [
  {
    title: "Mes Examens\nRadiologiques",
    image: RadioCategory,
    route: "/list-examins-radiologiques",
  },
  {
    title: "Mes Examens\nBiologiques",
    image: BioCategory,
    route: "/list-biologie",
  },
  {
    title: "Mes\nMedicaments",
    image: MedicationCategory,
    route: "/list-medicaments",
  },
  {
    title: "Mes\nConsultations",
    image: ConsultationCategory,
    route: "/list-consultations",
  },
  {
    title: "Acces\nRapides",
    image: QuickAccess,
    route: "/acces-rapide",
  },
] as const;

// Types
interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  rating: number;
  date: string;
  time: string;
  color?: string;
}

interface Medication {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  dosage: string;
  stock: string;
  duration: string;
  frequency: string;
  notes: string;
  schedule: {
    matin: boolean;
    apres_midi: boolean;
    soir: boolean;
    nuit: boolean;
  };
  reminders: string[];
  file: UploadedFile | null;
  image: UploadedFile | null;
  momentDePrise: string;
  isActive: boolean;
}

interface UploadedFile {
  uri: string;
  name: string;
}

function Dashboard() {
  // Hooks
  const { colors } = useTheme();
  const router = useRouter();
  const [unreadNotificationsNumber, setUnreadNotificationsNumber] = useState(0);

  console.log("unreadNotificationsNumber", unreadNotificationsNumber);

  // State
  const [username, setUsername] = useState<string>("Guest");
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);
  const [currentAvatarId, setCurrentAvatarId] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [medicaments, setMedicaments] = useState<Medication[]>([]);

  console.log("medicaments", medicaments.length);

  const filteredMedicaments = medicaments.filter(
    (medicament) => new Date(medicament.endDate) > new Date()
  );

  let filtredData = consultations.filter(
    (consultation) =>
      new Date(consultation.nextConsultationDate).getTime() >
      new Date().getTime()
  );

  let monPlanningItems = [...filtredData, ...filteredMedicaments];

  monPlanningItems = monPlanningItems.sort((a, b) => {
    // If both items are consultations, sort by nextConsultationDate
    if (a.nextConsultationDate && b.nextConsultationDate) {
      return (
        new Date(a.nextConsultationDate).getTime() -
        new Date(b.nextConsultationDate).getTime()
      );
    }
    // If both items are medications, sort by endDate
    if (a.endDate && b.endDate) {
      return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
    }
    // If mixing types, consultation's nextConsultationDate vs medication's endDate
    const dateA = a.nextConsultationDate
      ? new Date(a.nextConsultationDate)
      : new Date(a.endDate);
    const dateB = b.nextConsultationDate
      ? new Date(b.nextConsultationDate)
      : new Date(b.endDate);
    return dateA.getTime() - dateB.getTime();
  });

  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  const fetchConsultations = async () => {
    try {
      const { data, error } = await supabase
        .from("consultations")
        .select("*, specialties(name, hexColor)")
        .order("date", { ascending: true });

      if (error) throw error;

      setConsultations(data || []);
    } catch (e) {
      console.error("Error fetching consultations:", e);
    }
  };

  const fetchMedications = async () => {
    const { data, error } = await supabase
      .from("medicaments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching medications:", error);
      return;
    }

    if (data) {
      // Transform the data to match your component's needs
      const transformedData = data.map((med) => ({
        ...med,
        isActive: new Date(med.endDate) > new Date(), // Check if medication is still active
      }));
      setMedicaments(transformedData);
    }
  };

  useEffect(() => {
    fetchConsultations();

    const subscription = supabase
      .channel("consultations_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "consultations",
        },
        () => {
          fetchConsultations();
        }
      )
      .subscribe();

    fetchMedications();

    // Set up real-time subscription
    const subscriptionMedicament = supabase
      .channel("medicaments_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "medicaments",
        },
        async (payload) => {
          const { data } = await supabase.from("medicaments").select("*");
          if (data) {
            const transformedData = data.map((med) => ({
              ...med,
              isActive: new Date(med.endDate) > new Date(),
            }));
            setMedicaments(transformedData);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      subscriptionMedicament.unsubscribe();
    };
  }, []);

  // Add shimmer animation effect
  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    if (isLoading) {
      shimmer.start();
    } else {
      shimmer.stop();
    }

    return () => shimmer.stop();
  }, [isLoading, shimmerAnimation]);

  useEffect(() => {
    let unreadNotifications = notificationStore$.notification
      .get()
      .filter(
        (notification) =>
          notification.date.getTime() <= new Date().getTime() &&
          !notification.isRead
      );

    setUnreadNotificationsNumber(unreadNotifications.length);
    const interval = setInterval(() => {
      let unreadNotifications = notificationStore$.notification
        .get()
        .filter(
          (notification) =>
            notification.date.getTime() <= new Date().getTime() &&
            !notification.isRead
        );
      setUnreadNotificationsNumber(unreadNotifications.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const renderSkeletonCard = () => (
    <View
      className="w-64 bg-white rounded-3xl p-4 mr-4"
      style={categoryCardStyle}
    >
      <View className="flex-row items-center justify-between mb-10">
        <View className="flex flex-row items-start gap-x-3">
          <Animated.View
            className="w-10 h-10 rounded-full bg-gray-200"
            style={{
              opacity: shimmerAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.7],
              }),
            }}
          />
          <View className="flex-1">
            <Animated.View
              className="h-4 w-32 bg-gray-200 rounded mb-2"
              style={{
                opacity: shimmerAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 0.7],
                }),
              }}
            />
            <Animated.View
              className="h-3 w-24 bg-gray-200 rounded mb-2"
              style={{
                opacity: shimmerAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 0.7],
                }),
              }}
            />
            <Animated.View
              className="h-3 w-16 bg-gray-200 rounded"
              style={{
                opacity: shimmerAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 0.7],
                }),
              }}
            />
          </View>
        </View>
      </View>
      <View className="flex flex-row items-center justify-between">
        <Animated.View
          className="h-3 w-20 bg-gray-200 rounded"
          style={{
            opacity: shimmerAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 0.7],
            }),
          }}
        />
        <Animated.View
          className="h-3 w-20 bg-gray-200 rounded"
          style={{
            opacity: shimmerAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 0.7],
            }),
          }}
        />
      </View>
    </View>
  );

  // Effects
  useEffect(() => {
    fetchUserData();
  }, []);

  // Handlers
  const fetchUserData = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;

      if (user) {
        // Set username
        if (user.user_metadata?.displayName) {
          setUsername(user.user_metadata.displayName);
        } else if (user.email) {
          setUsername(user.email.split("@")[0]);
        }

        // Set avatar
        if (user.user_metadata?.avatarId) {
          setCurrentAvatarId(user.user_metadata.avatarId);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Error", "Failed to load user data");
    }
  };

  const handleAvatarSelect = async (avatarId: number) => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatarId },
      });

      if (updateError) throw updateError;

      setCurrentAvatarId(avatarId);
    } catch (error) {
      console.error("Error updating avatar:", error);
      Alert.alert("Error", "Failed to update avatar");
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchUserData();
    setIsRefreshing(false);
  };

  // Memoized values
  const categoryItems = useMemo(
    () =>
      categories.map((category, index) => (
        <TouchableOpacity
          key={index}
          className="w-[30%] aspect-square bg-white rounded-3xl p-4 mb-4 items-center justify-between"
          style={categoryCardStyle}
          onPress={() => router.push(category.route as any)}
        >
          <category.image width={120} height={120} />
          <Text className="text-center text-gray-900 font-bold text-xs">
            {category.title}
          </Text>
        </TouchableOpacity>
      )),
    []
  );

  // Determine which avatar component to use
  const AvatarComponent: AvatarType =
    currentAvatarId && avatars[currentAvatarId]
      ? avatars[currentAvatarId]
      : DefaultAvatar;

  return (
    <SafeAreaView className="flex-1  bg-gray-50">
      {/* Header */}
      <View className="px-6 pt-2.5  bg-white">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center space-x-3">
            <TouchableOpacity
              onPress={() => setIsAvatarModalVisible(true)}
              className="relative"
            >
              <AvatarComponent width={56} height={56} />
              <View className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
                <Plus size={16} color="#CBCBCB" />
              </View>
            </TouchableOpacity>
            <View>
              <View className="flex-row items-end ml-2">
                <Text className="text-primary-500 text-3xl font-extrabold">
                  Bonjour,
                </Text>
                <Text className="text-primary-500 text-2xl font-bold">
                  {" "}
                  {username}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity onPress={() => router.push("/notifaction")}>
            <View className="relative">
              <Bell size={24} color={colors.text} />
              {unreadNotificationsNumber > 0 && (
                <View className="absolute -top-2 -right-2 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
                  <Text className="text-white text-xs font-bold">
                    {unreadNotificationsNumber}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        className="flex-1 pb-10 "
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Medical Planning Section */}
        <View className="ml-6 py-6">
          <Text className="text-2xl font-extrabold text-primary-500 mb-4">
            Mon planning médical ...
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex flex-row gap-4"
          >
            {monPlanningItems.length > 0 ? (
              monPlanningItems.map((consultations: any) => {
                let isConsultation = !!consultations?.nextConsultationDate;
                return (
                  <View
                    key={consultations.id}
                    className={`w-64 bg-primary-500 rounded-3xl flex-col justify-between p-4 pb-5 mr-4`}
                  >
                    <View className="flex-row items-center justify-between mb-6">
                      <View className="flex flex-row items-start gap-x-3">
                        <View className="bg-gray-100 rounded-full h-12 w-12 justify-center items-center">
                          <Doctor width={24} height={24} />
                        </View>
                        <View>
                          <Text className="text-white font-medium">
                            {isConsultation
                              ? consultations?.doctorName
                              : consultations.name}
                          </Text>
                          <Text className="text-indigo-200">
                            {isConsultation
                              ? consultations?.specialties?.name
                              : consultations?.momentDePrise}
                          </Text>
                          <View className="flex-row items-center">
                            <Text className="text-white mr-1">
                              {isConsultation ? "Consultation" : "Medicament"}
                            </Text>
                            <Star size={16} color="#FCD34D" fill="#FCD34D" />
                          </View>
                        </View>
                      </View>
                    </View>
                    <View className="flex flex-row items-center gap-x-4 mt-2">
                      <View className="flex-row items-center gap-x-2">
                        <Calendar size={16} color="#E0E7FF" className="mr-2" />
                        <Text className="text-indigo-100">
                          {isConsultation
                            ? new Date(
                                consultations.nextConsultationDate
                              ).toLocaleDateString("fr-FR")
                            : new Date(
                                consultations.endDate
                              ).toLocaleDateString("fr-FR")}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-x-2">
                        <Clock size={16} color="#E0E7FF" className="mr-2" />
                        <Text className="text-indigo-100">
                          {isConsultation
                            ? new Date(
                                consultations.nextConsultationDate
                              ).toLocaleTimeString("fr-FR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : new Date(
                                consultations.endDate
                              ).toLocaleTimeString("fr-FR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
            ) : (
              <>
                {[1, 2].map((key) => (
                  <View key={key}>{renderSkeletonCard()}</View>
                ))}
              </>
            )}
          </ScrollView>
        </View>

        {/* Categories Section */}
        <View className="px-6 mb-6 h-full">
          <Text className="text-2xl font-extrabold text-primary-500 mb-4">
            Categories
          </Text>
          <View className="flex flex-row flex-wrap justify-start gap-x-4 gap-y-0">
            {categoryItems}
          </View>
        </View>
      </ScrollView>

      {/* Avatar Selection Modal */}
      <AvatarSelectionModal
        visible={isAvatarModalVisible}
        onClose={() => setIsAvatarModalVisible(false)}
        onSelectAvatar={handleAvatarSelect}
        username={username}
        currentAvatarId={currentAvatarId ?? 13}
      />
    </SafeAreaView>
  );
}

export default observer(Dashboard);
