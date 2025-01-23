import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  TouchableWithoutFeedback,
  Modal,
  Animated,
  StyleSheet,
  Image as RNImage,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native";
import Medicine from "@/assets/images/medicine.svg";

import {
  ChevronLeft,
  FileText,
  Clock,
  Pill,
  FileUp,
  ChevronDown,
  FlaskConical,
  X,
  Container,
  Image,
  Timer,
  Repeat,
  Plus,
  Upload,
  ImageIcon,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { supabase } from "@/utils/supabase";
import { Calendar as RNCalendar, LocaleConfig } from "react-native-calendars";
import { Calendar as LucideCalendar } from "lucide-react-native";
import BioCategory from "@/assets/images/bioCategory.svg";
import { scheduleNotification } from "@/utils/notifcations";

// Configure French locale
LocaleConfig.locales["fr"] = {
  monthNames: [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ],
  monthNamesShort: [
    "Janv.",
    "Févr.",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juil.",
    "Août",
    "Sept.",
    "Oct.",
    "Nov.",
    "Déc.",
  ],
  dayNames: [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
  ],
  dayNamesShort: ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."],
  today: "Aujourd'hui",
};
LocaleConfig.defaultLocale = "fr";

interface UploadedFile {
  uri: string;
  type: "image" | "document";
  name: string;
}

const momentDePriseOptions = [
  { label: "Avant le repas", value: "avant_le_repas" },
  { label: "Pendant le repas", value: "pendant_le_repas" },
  { label: "Après le repas", value: "apres_le_repas" },
  { label: "Non précisé", value: "non_precise" },
];

interface MedicationFormData {
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
  files: UploadedFile[];
  momentDePrise: string;
}

const ReminderModal = ({
  visible,
  onClose,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (time: string) => void;
}) => {
  const [time, setTime] = useState("");
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setTime(""); // Reset the time state when the modal becomes visible
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [visible]);

  const handleTimeChange = (text: string) => {
    let formattedTime = text.replace(/[^0-9]/g, "");
    if (formattedTime.length > 2 && !formattedTime.includes(":")) {
      formattedTime = formattedTime.slice(0, 2) + ":" + formattedTime.slice(2);
    }
    if (formattedTime.length > 5) {
      formattedTime = formattedTime.slice(0, 5);
    }
    setTime(formattedTime);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Ajouter un rappel</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.timeInputContainer}>
            <TextInput
              ref={inputRef}
              value={time}
              onChangeText={handleTimeChange}
              placeholder="23:55"
              placeholderTextColor="#9CA3AF"
              style={styles.timeInput}
              keyboardType="numeric"
              maxLength={5}
            />
          </View>

          <TouchableOpacity
            onPress={() => {
              onSave(time);
              onClose();
            }}
            className="bg-primary-500 py-4 rounded-xl "
          >
            <Text className="bg-primary-500 text-secondary text-center font-bold">
              Enregistrer
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    width: "80%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  timeInputContainer: {
    borderBottomWidth: 2,
    borderBottomColor: "#E5E7EB",
    marginBottom: 24,
  },
  timeInput: {
    fontSize: 36,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
    paddingVertical: 8,
  },
});

export default function AddMedicament() {
  const router = useRouter();
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<MedicationFormData>({
    name: "",
    startDate: "",
    endDate: "",
    dosage: "",
    stock: "",
    duration: "",
    frequency: "",
    notes: "",
    schedule: {
      matin: false,
      apres_midi: false,
      soir: false,
      nuit: false,
    },
    reminders: [],
    files: [] as UploadedFile[],
    momentDePrise: "",
  });

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showMomentDePrisePicker, setShowMomentDePrisePicker] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);

  const addReminder = (time: string) => {
    setFormData((prev) => ({
      ...prev,
      reminders: [...prev.reminders, time],
    }));
  };

  const removeReminder = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      reminders: prev.reminders.filter((_, i) => i !== index),
    }));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const newFile: UploadedFile = {
        uri: result.assets[0].uri,
        type: "image",
        name: result.assets[0].uri.split("/").pop() || "image",
      };
      setFormData((prev) => ({
        ...prev,
        files: [...prev.files, newFile],
      }));
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
    });

    if (!result.canceled && result.assets[0]) {
      const newFile: UploadedFile = {
        uri: result.assets[0].uri,
        type: "document",
        name: result.assets[0].name,
      };
      setFormData((prev) => ({
        ...prev,
        files: [...prev.files, newFile],
      }));
    }
  };

  const takePicture = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (permission.granted) {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        const newFile: UploadedFile = {
          uri: result.assets[0].uri,
          type: "image",
          name: result.assets[0].uri.split("/").pop() || "image",
        };
        setFormData((prev) => ({
          ...prev,
          files: [...prev.files, newFile],
        }));
      }
    }
  };

  const deleteFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError) throw userError;

      console.log(JSON.stringify(formData, null, 2));
      const { data: medicamentData, error: medicamentError } = await supabase
        .from("medicaments")
        .insert({
          name: formData.name,
          startDate: formData.startDate,
          endDate: formData.endDate,
          dosage: formData.dosage,
          notes: formData.notes,
          schedule: formData.schedule,
          momentDePrise: formData.momentDePrise,
          stock: formData.stock,
          duration: formData.duration,
          frequency: formData.frequency,
          rappel: formData.reminders.length > 0,
          user_id: userData.user.id,
          created_at: new Date(),
        })
        .select();

      if (medicamentError) throw medicamentError;

      // Create reminders for each day between start and end date
      if (
        formData.reminders.length > 0 &&
        formData.startDate &&
        formData.endDate
      ) {
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        let notifactionIds: string[] = [];
        // Loop through each day
        for (let date = start; date <= end; date.setDate(date.getDate() + 1)) {
          // Loop through each reminder time
          formData.reminders.forEach((reminderTime) => {
            const [hours, minutes] = reminderTime.split(":");
            const reminderDate = new Date(date);
            reminderDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            let randomIdString =
              Math.random().toString(36).substring(2, 15) +
              Math.random().toString(36).substring(2, 15);
            notifactionIds.push(randomIdString);
            scheduleNotification(
              randomIdString,
              `Rappel: ${formData.name}`,
              `Il est temps de prendre votre médicament ${formData.name}. ${
                formData.notes ? `\nNotes: ${formData.notes}` : ""
              }`,
              reminderDate
            );
          });
        }
        // Update the medicament record with notification IDs
        const { error: updateError } = await supabase
          .from("medicaments")
          .update({ notificationId: notifactionIds })
          .eq("id", medicamentData[0].id);

        if (updateError) throw updateError;
      }

      Alert.alert("Succès", "Médicament ajouté avec succès");
      router.push("/list-medicaments");
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Erreur", "Échec de l'enregistrement. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Sélectionner une date";
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };

  const onChangeStartDate = (date: any) => {
    setFormData((prev) => ({ ...prev, startDate: date.dateString }));
    setShowStartDatePicker(false);
  };

  const onChangeEndDate = (date: any) => {
    setFormData((prev) => ({ ...prev, endDate: date.dateString }));
    setShowEndDatePicker(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 pt-4">
      <TouchableWithoutFeedback
        onPress={() => {
          setShowStartDatePicker(false);
          setShowEndDatePicker(false);
          setShowMomentDePrisePicker(false);
          setShowReminderModal(false);
        }}
      >
        <View className="flex-1 bg-gray-50">
          {/* Header */}

          <View className=" flex-row justify-between  items-start px-6 pt-2 pb-2 bg-white">
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
              >
                <ChevronLeft size={34} color={colors.primary} />
              </TouchableOpacity>
              <Text className="text-primary-500 text-2xl font-extrabold ml-4">
                Ajouter un médicament
              </Text>
            </View>
          </View>

          <ScrollView className="flex-1 p-6">
            <View className="space-y-4 pb-10">
              {/* Nom du médicament */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">
                  Nom du médicament
                </Text>
                <View className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 h-12">
                  <Pill size={20} color={colors.text} className="opacity-50" />
                  <TextInput
                    value={formData.name}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, name: text }))
                    }
                    placeholder="Nom du médicament"
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 ml-3"
                  />
                </View>
              </View>

              {/* Date de début */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">
                  Date de début
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowStartDatePicker(!showStartDatePicker);
                    setShowEndDatePicker(false);
                  }}
                  className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 h-12"
                >
                  <LucideCalendar
                    size={20}
                    color={colors.text}
                    className="opacity-50"
                  />
                  <Text className="flex-1 ml-3 text-gray-700">
                    {formatDate(formData.startDate)}
                  </Text>
                </TouchableOpacity>
                {showStartDatePicker && (
                  <View className="z-10 mt-1 w-full bg-white rounded-xl shadow-lg">
                    <RNCalendar
                      onDayPress={onChangeStartDate}
                      markedDates={{
                        [formData.startDate]: {
                          selected: true,
                          selectedColor: colors.primary,
                        },
                      }}
                      theme={{
                        backgroundColor: "#ffffff",
                        calendarBackground: "#ffffff",
                        textSectionTitleColor: colors.text,
                        selectedDayBackgroundColor: colors.primary,
                        selectedDayTextColor: "#ffffff",
                        todayTextColor: colors.primary,
                        dayTextColor: colors.text,
                        textDisabledColor: "#d9e1e8",
                        dotColor: colors.primary,
                        selectedDotColor: "#ffffff",
                        arrowColor: colors.text,
                        monthTextColor: colors.text,
                        indicatorColor: "blue",
                        textDayFontFamily: "System",
                        textMonthFontFamily: "System",
                        textDayHeaderFontFamily: "System",
                        textDayFontWeight: "300",
                        textMonthFontWeight: "bold",
                        textDayHeaderFontWeight: "300",
                        textDayFontSize: 16,
                        textMonthFontSize: 16,
                        textDayHeaderFontSize: 16,
                      }}
                    />
                  </View>
                )}
              </View>

              {/* Date de fin */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">
                  Date de fin
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowEndDatePicker(!showEndDatePicker);
                    setShowStartDatePicker(false);
                  }}
                  className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 h-12"
                >
                  <LucideCalendar
                    size={20}
                    color={colors.text}
                    className="opacity-50"
                  />
                  <Text className="flex-1 ml-3 text-gray-700">
                    {formatDate(formData.endDate)}
                  </Text>
                </TouchableOpacity>
                {showEndDatePicker && (
                  <View className="z-10 mt-1 w-full bg-white rounded-xl shadow-lg">
                    <RNCalendar
                      onDayPress={onChangeEndDate}
                      markedDates={{
                        [formData.endDate]: {
                          selected: true,
                          selectedColor: colors.primary,
                        },
                      }}
                      theme={{
                        backgroundColor: "#ffffff",
                        calendarBackground: "#ffffff",
                        textSectionTitleColor: colors.text,
                        selectedDayBackgroundColor: colors.primary,
                        selectedDayTextColor: "#ffffff",
                        todayTextColor: colors.primary,
                        dayTextColor: colors.text,
                        textDisabledColor: "#d9e1e8",
                        dotColor: colors.primary,
                        selectedDotColor: "#ffffff",
                        arrowColor: colors.text,
                        monthTextColor: colors.text,
                        indicatorColor: "blue",
                        textDayFontFamily: "System",
                        textMonthFontFamily: "System",
                        textDayHeaderFontFamily: "System",
                        textDayFontWeight: "300",
                        textMonthFontWeight: "bold",
                        textDayHeaderFontWeight: "300",
                        textDayFontSize: 16,
                        textMonthFontSize: 16,
                        textDayHeaderFontSize: 16,
                      }}
                    />
                  </View>
                )}
              </View>

              {/* Dosage */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">
                  Dosage
                </Text>
                <View className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 h-12">
                  <FlaskConical
                    size={20}
                    color={colors.text}
                    className="opacity-50"
                  />
                  <TextInput
                    value={formData.dosage}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, dosage: text }))
                    }
                    placeholder="Ex: 50 mg, 50 ml"
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 ml-3"
                  />
                </View>
              </View>

              {/* Stock */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">
                  Stock
                </Text>
                <View className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 h-12">
                  <Container
                    size={20}
                    color={colors.text}
                    className="opacity-50"
                  />
                  <TextInput
                    value={formData.stock}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, stock: text }))
                    }
                    placeholder="Ex: 50 comprimés"
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 ml-3"
                  />
                </View>
              </View>

              {/* Durée */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">
                  Durée
                </Text>
                <View className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 h-12">
                  <Timer size={20} color={colors.text} className="opacity-50" />
                  <TextInput
                    value={formData.duration}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, duration: text }))
                    }
                    placeholder="Ex: 10 jours"
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 ml-3"
                  />
                </View>
              </View>

              {/* Fréquence */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">
                  Fréquence
                </Text>
                <View className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 h-12">
                  <Repeat
                    size={20}
                    color={colors.text}
                    className="opacity-50"
                  />
                  <TextInput
                    value={formData.frequency}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, frequency: text }))
                    }
                    placeholder="Ex: X fois/jours, tous les jours"
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 ml-3"
                  />
                </View>
              </View>

              {/* Moment de prise */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">
                  Moment de prise
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    setShowMomentDePrisePicker(!showMomentDePrisePicker)
                  }
                  className="flex-row items-center justify-between bg-white rounded-xl border border-gray-200 px-4 h-12"
                >
                  <View className="flex-row items-center">
                    <Clock
                      size={20}
                      color={colors.text}
                      className="opacity-50"
                    />
                    <Text className="ml-3 text-gray-700">
                      {formData.momentDePrise
                        ? momentDePriseOptions.find(
                            (option) => option.value === formData.momentDePrise
                          )?.label
                        : "Sélectionner le moment"}
                    </Text>
                  </View>
                  <ChevronDown
                    size={20}
                    color={colors.text}
                    className="opacity-50"
                  />
                </TouchableOpacity>
              </View>

              {showMomentDePrisePicker && (
                <View className="bg-white rounded-xl border border-gray-200 mt-1">
                  {momentDePriseOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => {
                        setFormData((prev) => ({
                          ...prev,
                          momentDePrise: option.value,
                        }));
                        setShowMomentDePrisePicker(false);
                      }}
                      className="p-3 border-b border-gray-200"
                    >
                      <Text>{option.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Rappels */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">
                  Rappels
                </Text>
                <View className="bg-white rounded-xl border border-gray-200 p-4">
                  {formData.reminders.map((time, index) => (
                    <View
                      key={index}
                      className="flex-row items-center justify-between mb-2 bg-gray-50 p-3 rounded-lg"
                    >
                      <View className="flex-row items-center">
                        <Clock
                          size={20}
                          color={colors.text}
                          className="opacity-50"
                        />
                        <Text className="ml-3">{time}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => removeReminder(index)}
                        className="bg-gray-200 rounded-full p-2"
                      >
                        <X size={16} color={colors.text} />
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TouchableOpacity
                    onPress={() => setShowReminderModal(true)}
                    className="flex-row items-center justify-center py-3 mt-2 border-t border-gray-200"
                  >
                    <Plus size={20} color="#8B5CF6" />
                    <Text className="ml-2 text-primary-500 font-medium">
                      Ajouter un rappel
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Notes */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">
                  Notes
                </Text>
                <View className="bg-white rounded-xl border border-gray-200 p-4">
                  <TextInput
                    value={formData.notes}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, notes: text }))
                    }
                    placeholder="Ajouter des notes..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={4}
                    className="min-h-[100] text-gray-700"
                    textAlignVertical="top"
                  />
                </View>
              </View>

              {/* Ordonnance */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">
                  Ordonnance
                </Text>
                <View className="bg-white rounded-xl border border-gray-200 p-4">
                  <View className="flex-row justify-around mb-4">
                    <TouchableOpacity
                      onPress={pickImage}
                      className="items-center"
                    >
                      <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mb-2">
                        <ImageIcon size={24} color={colors.primary} />
                      </View>
                      <Text className="text-sm text-gray-600">Galerie</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={takePicture}
                      className="items-center"
                    >
                      <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mb-2">
                        <Upload size={24} color={colors.primary} />
                      </View>
                      <Text className="text-sm text-gray-600">Camera</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={pickDocument}
                      className="items-center"
                    >
                      <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mb-2">
                        <FileText size={24} color={colors.primary} />
                      </View>
                      <Text className="text-sm text-gray-600">Document</Text>
                    </TouchableOpacity>
                  </View>

                  {formData.files.length > 0 && (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      className="flex-row gap-2"
                    >
                      {formData.files.map((file, index) => (
                        <View key={index} className="relative">
                          {file.type === "image" ? (
                            <RNImage
                              source={{ uri: file.uri }}
                              className="w-20 h-20 rounded-lg"
                            />
                          ) : (
                            <View className="w-20 h-20 bg-gray-200 rounded-lg items-center justify-center">
                              <FileText size={24} color={colors.primary} />
                              <Text
                                className="text-xs text-gray-600 mt-1"
                                numberOfLines={1}
                              >
                                {file.name}
                              </Text>
                            </View>
                          )}
                          <TouchableOpacity
                            onPress={() => deleteFile(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full items-center justify-center"
                            hitSlop={{
                              top: 10,
                              right: 10,
                              bottom: 10,
                              left: 10,
                            }}
                          >
                            <X size={12} color="white" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </ScrollView>
                  )}
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Submit Button */}
          <View className="p-6 bg-white border-t border-gray-200">
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading}
              className={`w-full rounded-xl py-3 items-center ${
                isLoading ? "bg-primary-500" : "bg-primary-500"
              }`}
            >
              <Text className="text-white font-semibold text-lg">
                {isLoading ? "Chargement..." : "Enregistrer"}
              </Text>
            </TouchableOpacity>
          </View>
          <ReminderModal
            visible={showReminderModal}
            onClose={() => setShowReminderModal(false)}
            onSave={(time) => {
              addReminder(time);
              setShowReminderModal(false);
            }}
          />
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
