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
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "@react-navigation/native";
import {
  ChevronLeft,
  Calendar,
  FileText,
  Clock,
  Pill,
  FileUp,
  ChevronDown,
  FlaskConical,
  Container,
  Trash2,
  Edit2,
  Save,
  X,
  Download,
  Image,
} from "lucide-react-native";
import * as DocumentPicker from "expo-document-picker";
import { supabase } from "@/utils/supabase";
import { Calendar as RNCalendar, LocaleConfig } from "react-native-calendars";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

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
  name: string;
}

export default function MedicamentDetail({
  initialData,
}: {
  initialData: any;
}) {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    dosage: "",
    notes: "",
    schedule: {
      matin: false,
      apres_midi: false,
      soir: false,
      nuit: false,
    },
    file: null as UploadedFile | null,
    image: null as UploadedFile | null,
    momentDePrise: "",
    stock: "",
  });

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showMomentDePrisePicker, setShowMomentDePrisePicker] = useState(false);
  const dropdownAnimation = useRef(new Animated.Value(0)).current;
  const momentDePriseInputRef = useRef(null);
  const [dropdownLayout, setDropdownLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const momentDePriseOptions = [
    { label: "Avant le repas", value: "avant_le_repas" },
    { label: "Pendant le repas", value: "pendant_le_repas" },
    { label: "Après le repas", value: "apres_le_repas" },
    { label: "Non précisé", value: "non_precise" },
  ];

  useEffect(() => {
    fetchMedicamentDetails();
  }, [id]);

  const fetchMedicamentDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("medicaments")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      if (data) {
        setFormData({
          ...data,
          file: data.file
            ? { uri: data.file, name: data.file.split("/").pop() || "" }
            : null,
          image: data.image
            ? { uri: data.image, name: data.image.split("/").pop() || "" }
            : null,
        });
      }
    } catch (error) {
      console.error("Error fetching medicament:", error);
      Alert.alert("Error", "Failed to load medication details");
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("medicaments")
        .delete()
        .eq("id", id);

      if (error) throw error;

      if (formData.file) {
        await supabase.storage.from("medicaments").remove([formData.file.uri]);
      }

      Alert.alert("Success", "Medication deleted successfully");
      router.push("/list-medicaments");
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Failed to delete medication");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      let filePath = formData.file?.uri || null;

      if (formData.file && formData.file.uri.startsWith("file://")) {
        const fileName = formData.file.uri.split("/").pop();
        if (fileName) {
          filePath = `${Date.now()}_${fileName}`;
          const response = await fetch(formData.file.uri);
          const blob = await response.blob();

          const { error: uploadError } = await supabase.storage
            .from("medicaments")
            .upload(filePath, blob);

          if (uploadError) throw uploadError;
        }
      }

      const { error } = await supabase
        .from("medicaments")
        .update({
          name: formData.name,
          startDate: formData.startDate,
          endDate: formData.endDate,
          dosage: formData.dosage,
          notes: formData.notes,
          schedule: formData.schedule,
          file: filePath,
          momentDePrise: formData.momentDePrise,
          stock: formData.stock,
        })
        .eq("id", id);

      if (error) throw error;

      Alert.alert("Success", "Medication updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Failed to update medication");
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

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
    });

    if (result.assets && result.assets[0]) {
      setFormData((prev) => ({
        ...prev,
        file: {
          uri: result.assets[0].uri,
          name: result.assets[0].name,
        },
      }));
    }
  };

  const deleteFile = () => {
    setFormData((prev) => ({
      ...prev,
      file: null,
    }));
  };

  const saveFile = async (file: UploadedFile | null) => {
    if (file) {
      try {
        const path = file.uri;
        const { data, error } = await supabase.storage
          .from("medicaments") // Replace with your bucket name
          .createSignedUrl(path, 3600);

        if (error) {
          throw new Error("No signed URL available");
        }

        let signedUrl = data?.signedUrl;

        // Get file name from path
        const fileName = path.split("/").pop() || "downloaded-file";

        // Download to local filesystem
        const downloadResult = await FileSystem.downloadAsync(
          signedUrl,
          FileSystem.documentDirectory + fileName
        );

        if (downloadResult.status !== 200) {
          throw new Error("Download failed");
        }

        // Share the file
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(downloadResult.uri);
        } else {
          throw new Error("Sharing is not available on this platform");
        }
      } catch (error) {
        console.error("Error downloading file:", error);
      }
    }
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        setShowStartDatePicker(false);
        setShowEndDatePicker(false);
        setShowMomentDePrisePicker(false);
      }}
    >
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="px-6 pt-14 pb-6 bg-white">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
              >
                <ChevronLeft size={24} color={colors.text} />
              </TouchableOpacity>
              <Text className="font-bold text-xl text-gray-900 ml-4">
                Détails du médicament
              </Text>
            </View>
            <View className="flex-row gap-2">
              {!isEditing ? (
                <>
                  <TouchableOpacity
                    onPress={() => setIsEditing(true)}
                    className="w-10 h-10 items-center justify-center rounded-full bg-primary-100"
                  >
                    <Edit2 size={20} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setShowDeleteConfirm(true)}
                    className="w-10 h-10 items-center justify-center rounded-full bg-red-100"
                  >
                    <Trash2 size={20} color="rgb(220 38 38)" />
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  onPress={handleUpdate}
                  className="w-10 h-10 items-center justify-center rounded-full bg-primary"
                >
                  <Save size={20} color="white" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Content */}
        <ScrollView className="flex-1 p-6">
          <View className="space-y-4">
            {/* Name Input */}
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
                  editable={isEditing}
                />
              </View>
            </View>

            {/* Start Date Input */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Date de début
              </Text>
              <TouchableOpacity
                onPress={() =>
                  isEditing && setShowStartDatePicker(!showStartDatePicker)
                }
                className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 h-12"
              >
                <Calendar
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
                    onDayPress={(day) => {
                      onChangeStartDate(day);
                    }}
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

            {/* End Date Input */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Date de fin
              </Text>
              <TouchableOpacity
                onPress={() =>
                  isEditing && setShowEndDatePicker(!showEndDatePicker)
                }
                className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 h-12"
              >
                <Calendar
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
                    onDayPress={(day) => {
                      onChangeEndDate(day);
                    }}
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

            {/* Dosage Input */}
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
                  placeholder="Ex: 1 comprimé"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 ml-3"
                  editable={isEditing}
                />
              </View>
            </View>

            {/* Stock Input */}
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
                  placeholder="Ex: 30 comprimés"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 ml-3"
                  editable={isEditing}
                />
              </View>
            </View>

            {/* Moment de prise Input */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Moment de prise
              </Text>
              <TouchableOpacity
                ref={momentDePriseInputRef}
                onPress={() =>
                  isEditing &&
                  setShowMomentDePrisePicker(!showMomentDePrisePicker)
                }
                className="flex-row items-center justify-between bg-white rounded-xl border border-gray-200 px-4 h-12"
              >
                <View className="flex-row items-center">
                  <Clock size={20} color={colors.text} className="opacity-50" />
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

            {/* Schedule Selection */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Horaire de prise
              </Text>
              <View className="bg-white rounded-xl border border-gray-200 p-4">
                <View className="flex-row flex-wrap gap-2">
                  {Object.entries(formData.schedule).map(
                    ([time, isSelected]) => (
                      <TouchableOpacity
                        key={time}
                        onPress={() =>
                          isEditing &&
                          setFormData((prev) => ({
                            ...prev,
                            schedule: {
                              ...prev.schedule,
                              [time]: !isSelected,
                            },
                          }))
                        }
                        className={`px-4 py-2 rounded-full border ${
                          isSelected
                            ? "bg-indigo-600 border-indigo-600"
                            : "border-gray-300"
                        }`}
                      >
                        <Text
                          className={`text-sm ${
                            isSelected ? "text-white" : "text-gray-700"
                          }`}
                        >
                          {time.charAt(0).toUpperCase() + time.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </View>
            </View>

            {/* Notes Input */}
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
                  editable={isEditing}
                />
              </View>
            </View>

            {/* File Upload Section */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Ordonnance
              </Text>
              <View className="bg-white rounded-xl border border-gray-200 p-4">
                {formData.file ? (
                  <View className="flex-row items-center justify-between relative">
                    <TouchableOpacity
                      onPress={() => saveFile(formData.file)}
                      className="flex-1 flex-row items-center  "
                    >
                      <FileText size={20} color={colors.text} />
                      <Text className="ml-2 text-sm text-gray-600">
                        {formData.file.name}
                      </Text>
                      <View className="flex-1 flex-row items-center justify-end">
                        <Download
                          size={20}
                          color={colors.text}
                          className="opacity-50"
                        />
                      </View>
                    </TouchableOpacity>
                    {isEditing && (
                      <TouchableOpacity
                        onPress={deleteFile}
                        className="p-1 bg-primary-100 rounded-full absolute right-0 -top-4"
                      >
                        <X className="bg-primary-200" size={16}></X>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  isEditing && (
                    <TouchableOpacity
                      onPress={pickDocument}
                      className="flex-row items-center justify-center py-4 border-2 border-dashed border-gray-300 rounded-lg"
                    >
                      <FileUp
                        size={20}
                        color={colors.text}
                        className="opacity-50"
                      />
                      <Text className="ml-2 text-sm text-gray-600">
                        Ajouter une ordonnance
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
              <View className="bg-white rounded-xl border border-gray-200 p-4">
                {formData.image ? (
                  <View className="flex-row items-center justify-between relative">
                    <TouchableOpacity
                      onPress={() => saveFile(formData.image)}
                      className="flex-1 flex-row items-center  "
                    >
                      <Image size={20} color={colors.text} />
                      <Text className="ml-2 text-sm text-gray-600">
                        {formData.image.name}
                      </Text>
                      <View className="flex-1 flex-row items-center justify-end">
                        <Download
                          size={20}
                          color={colors.text}
                          className="opacity-50"
                        />
                      </View>
                    </TouchableOpacity>
                    {isEditing && (
                      <TouchableOpacity
                        onPress={deleteFile}
                        className="p-1 bg-primary-100 rounded-full absolute right-0 -top-4"
                      >
                        <X className="bg-primary-200" size={16}></X>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  isEditing && (
                    <TouchableOpacity
                      onPress={pickDocument}
                      className="flex-row items-center justify-center py-4 border-2 border-dashed border-gray-300 rounded-lg"
                    >
                      <Image
                        size={20}
                        color={colors.text}
                        className="opacity-50"
                      />
                      <Text className="ml-2 text-sm text-gray-600">
                        Ajouter une ordonnance
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Delete Confirmation Modal */}
        <Modal
          visible={showDeleteConfirm}
          transparent={true}
          animationType="fade"
        >
          <View className="flex-1 bg-black/50 justify-center items-center p-4">
            <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
              <Text className="text-xl font-bold text-gray-900 mb-4">
                Confirmer la suppression
              </Text>
              <Text className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer ce médicament ? Cette action
                est irréversible.
              </Text>
              <View className="flex-row justify-end gap-4">
                <TouchableOpacity
                  onPress={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-lg"
                >
                  <Text className="text-gray-600">Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDelete}
                  className="px-4 py-2 bg-red-600 rounded-lg"
                >
                  <Text className="text-white font-medium">Supprimer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
}
