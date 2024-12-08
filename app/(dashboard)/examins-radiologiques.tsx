import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native";
import {
  ChevronLeft,
  Upload,
  Calendar,
  User2,
  Building2,
  FileText,
  Image as ImageIcon,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { supabase } from "@/utils/supabase";
import { decode as atob } from "base-64";

export default function ExamensRadiologiques() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { colors } = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    prescripteur: "",
    laboratory: "",
    notes: "",
    files: [] as string[],
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setFormData((prev) => ({
        ...prev,
        files: [...prev.files, result.assets[0].uri],
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
        setFormData((prev) => ({
          ...prev,
          files: [...prev.files, result.assets[0].uri],
        }));
      }
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
    });

    if (result.assets && result.assets[0]) {
      setFormData((prev) => ({
        ...prev,
        files: [...prev.files, result.assets[0].uri],
      }));
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    console.log("Form submitted:", formData);
    // Handle form submission here
    //router.back();
    //todo: add validation to make sure all fields are filled for now i assume all fields are filled
    //also the date picker is not a date picker it is a text input so we need to add a date picker
    //also add erros in the else and in the catchs
    let dataToInset = {
      files: formData.files,
      name: formData.name,
      date: formData.date,
      prescripteur: formData.prescripteur,
      laboratory: formData.laboratory,
      notes: formData.notes,
    };


    console.log("Form edited data cause mafia li 3mrhom:", dataToInset);

    //get supabase user id
    const { data: userData, error: userError } = await supabase.auth.getUser();

    let userId = userData?.user?.id;

    if (!userId) {
      console.log("No user id found");
      setIsLoading(false);
      return;
    }

    console.log("userId", userId);

    const { data, error } = await supabase
      .from("radiologie")
      .insert({
        name: dataToInset.name,
        date: dataToInset.date,
        phone: dataToInset.prescripteur,
        labName: dataToInset.laboratory,
        notes: dataToInset.notes,
        created_at: new Date(),
      })
      .select();

    console.log("Data inserted:", data);
    console.log("Error:", error);
    let supabaseFilePaths = [];
    if (!error) {
      for (let i = 0; i < dataToInset.files.length; i++) {
        let fileUri = dataToInset.files[i];
        try {
          // Get the file name from the URI
          const fileName = fileUri.split("/").pop();
          if (!fileName) {
            console.error("Could not generate filename");
            continue;
          }

          // Create a unique file path
          const filePath = `${userId}/${Date.now()}_${fileName}`;
          console.log("Uploading to path:", filePath);

          // Read the file as base64
          const response = await fetch(fileUri);
          const blob = await response.blob();

          console.log("Blob size:", blob.size);
          console.log("Blob type:", blob.type);

          // Convert blob to base64
          const reader = new FileReader();
          const base64Promise = new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
          });
          reader.readAsDataURL(blob);

          const base64Data = await base64Promise;
          const base64String = String(base64Data).split(",")[1];

          // Upload using base64
          const { data, error: uploadError } = await supabase.storage
            .from("radiologie")
            .upload(filePath, decode(base64String), {
              contentType: blob.type,
              upsert: false,
            });

          if (uploadError) {
            console.error("Upload error:", uploadError);
          } else {
            console.log("File uploaded successfully:", data);
            let supabaseFilePath = data.path;
            supabaseFilePaths.push(supabaseFilePath);
          }
        } catch (err) {
          console.error("Error processing file:", err, "for file:", fileUri);
        }
      }
      const { error } = await supabase
        .from("radiologie")
        .update({ uploads: supabaseFilePaths })
        .eq("id", data[0].id);

      if (error) {
        console.error("Error updating radiologie:", error);
      } else {
        console.log("Radiologie updated successfully");
        router.push("/list-radiologie");
      }
    } else {
      //error creating table row
    }
    setIsLoading(false);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="px-6 pt-14 pb-6 bg-red-0300">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
          >
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text className="text-xl font-semibold text-gray-900">Forum</Text>
          <View className="w-10 h-10 items-center justify-center rounded-full bg-gray-100">
            <FileText size={24} color={colors.primary} />
          </View>
        </View>
      </View>

      <View className="p-6">
        <View className="space-y-4">
          {/* Name/Type Input */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Nom / Type
            </Text>
            <View className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 h-12">
              <User2 size={20} color={colors.text} className="opacity-50" />
              <TextInput
                value={formData.name}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, name: text }))
                }
                placeholder="Nom / Type"
                className="flex-1 ml-3"
              />
            </View>
          </View>

          {/* Date Input */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1">Date</Text>
            <View className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 h-12">
              <Calendar size={20} color={colors.text} className="opacity-50" />
              <TextInput
                value={formData.date}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, date: text }))
                }
                placeholder="Date"
                className="flex-1 ml-3"
              />
            </View>
          </View>

          {/* Prescripteur Input */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Numero de Prescripteur
            </Text>
            <View className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 h-12">
              <User2 size={20} color={colors.text} className="opacity-50" />
              <TextInput
                value={formData.prescripteur}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, prescripteur: text }))
                }
                placeholder="Numero de Prescripteur"
                className="flex-1 ml-3"
              />
            </View>
          </View>

          {/* Laboratory Input */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Nom du Labo
            </Text>
            <View className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 h-12">
              <Building2 size={20} color={colors.text} className="opacity-50" />
              <TextInput
                value={formData.laboratory}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, laboratory: text }))
                }
                placeholder="Nom du Labo"
                className="flex-1 ml-3"
              />
            </View>
          </View>

          {/* File Upload Section */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Ajouter l'analyse
            </Text>
            <View className="bg-white rounded-xl border border-gray-200 p-4">
              <View className="flex-row justify-around mb-4">
                <TouchableOpacity onPress={pickImage} className="items-center">
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
                    <Image
                      key={index}
                      source={{ uri: file }}
                      className="w-20 h-20 rounded-lg"
                    />
                  ))}
                </ScrollView>
              )}
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
                multiline
                numberOfLines={4}
                className="min-h-[100]"
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            className="w-full h-14 bg-indigo-600 rounded-xl items-center justify-center mt-4"
          >
            <Text className="text-white font-semibold text-lg">
              {isLoading ? "Loading..." : "Ajouter"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

function decode(base64String: string) {
  const byteCharacters = atob(base64String);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return byteArray;
}
