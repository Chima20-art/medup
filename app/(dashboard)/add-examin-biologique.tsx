import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
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
  Mic,
  Play,
  Pause,
  MoreVertical,
  Trash,
  X,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Audio } from "expo-av";
import { supabase } from "@/utils/supabase";
import { decode as atob } from "base-64";
import { Calendar as RNCalendar } from 'react-native-calendars';
import BioCategory from "@/assets/images/bioCategory.svg";


interface AudioNote {
  id: string;
  uri: string;
  duration: number;
  currentTime: number;
  sound?: Audio.Sound;
}

interface UploadedFile {
  uri: string;
  type: "image" | "document";
  name: string;
}

export default function MergedExamensRadiologiques() {
  const router = useRouter();
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    prescripteur: "",
    laboratory: "",
    notes: "",
    files: [] as UploadedFile[],
  });
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioNotes, setAudioNotes] = useState<AudioNote[]>([]);
  const [selectedAudioId, setSelectedAudioId] = useState<string | null>(null);
  const [showOptionsFor, setShowOptionsFor] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
      audioNotes.forEach((note) => {
        if (note.sound) {
          note.sound.unloadAsync();
        }
      });
    };
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
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

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
    });

    if (result.assets && result.assets[0]) {
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

  const deleteFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === "granted") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const { recording } = await Audio.Recording.createAsync(
            Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(recording);
        setIsRecording(true);
      }
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    if (uri) {
      const { sound, status } = await Audio.Sound.createAsync({ uri });
      const newAudioNote: AudioNote = {
        id: Date.now().toString(),
        uri,
        duration: status.durationMillis ?? 0,
        currentTime: 0,
        sound,
      };
      setAudioNotes((prev) => [...prev, newAudioNote]);
    }
    setRecording(null);
  };

  const playPauseAudio = async (audioId: string) => {
    const audioNote = audioNotes.find((note) => note.id === audioId);
    if (!audioNote?.sound) return;

    if (selectedAudioId === audioId) {
      await audioNote.sound.pauseAsync();
      setSelectedAudioId(null);
    } else {
      if (selectedAudioId) {
        const playingNote = audioNotes.find(
            (note) => note.id === selectedAudioId
        );
        if (playingNote?.sound) {
          await playingNote.sound.stopAsync();
        }
      }
      await audioNote.sound.playAsync();
      setSelectedAudioId(audioId);

      audioNote.sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setAudioNotes((prev) =>
              prev.map((note) =>
                  note.id === audioId
                      ? { ...note, currentTime: status.positionMillis ?? 0 }
                      : note
              )
          );
          if (status.didJustFinish) {
            setSelectedAudioId(null);
          }
        }
      });
    }
  };

  const deleteAudio = async (audioId: string) => {
    const audioNote = audioNotes.find((note) => note.id === audioId);
    if (audioNote?.sound) {
      await audioNote.sound.unloadAsync();
    }
    setAudioNotes((prev) => prev.filter((note) => note.id !== audioId));
    setShowOptionsFor(null);
  };

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    console.log("Form submitted:", formData);

    const { data: userData, error: userError } = await supabase.auth.getUser();
    let userId = userData?.user?.id;

    if (!userId) {
      console.log("No user id found");
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
        .from("bilogie")
        .insert({
          name: formData.name,
          date: formData.date,
          phone: formData.prescripteur,
          labName: formData.laboratory,
          notes: formData.notes,
          created_at: new Date(),
        })
        .select();

    if (error) {
      console.error("Error inserting data:", error);
      Alert.alert("Error", "Failed to save form data. Please try again.");
      setIsLoading(false);
      return;
    }

    let supabaseFilePaths = [];
    for (let file of formData.files) {
      try {
        const fileName = file.uri.split("/").pop();
        if (!fileName) {
          console.error("Could not generate filename");
          continue;
        }

        const filePath = `${userId}/${Date.now()}_${fileName}`;
        console.log("Uploading to path:", filePath);

        const response = await fetch(file.uri);
        const blob = await response.blob();

        const reader = new FileReader();
        const base64Promise = new Promise((resolve) => {
          reader.onload = () => resolve(reader.result);
        });
        reader.readAsDataURL(blob);

        const base64Data = await base64Promise;
        const base64String = String(base64Data).split(",")[1];

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from("bilogie")
            .upload(filePath, decode(base64String), {
              contentType: blob.type,
              upsert: false,
            });

        if (uploadError) {
          console.error("Upload error:", uploadError);
        } else {
          console.log("File uploaded successfully:", uploadData);
          supabaseFilePaths.push(uploadData.path);
        }
      } catch (err) {
        console.error("Error processing file:", err, "for file:", file.uri);
      }
    }

    if (supabaseFilePaths.length > 0) {
      const { error: updateError } = await supabase
          .from("bilogie")
          .update({ uploads: supabaseFilePaths })
          .eq("id", data[0].id);

      if (updateError) {
        console.error("Error updating radiologie:", updateError);
      } else {
        console.log("Radiologie updated successfully");
      }
    }

    setIsLoading(false);
    Alert.alert("Success", "Form data and files saved successfully");
    router.push("/list-biologie");
  };

  return (
      <View className="flex-1 bg-gray-50 pt-8">
        <View className="px-6 pt-14 pb-6 bg-white">
          <View className="flex-row items-start">
            <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
            >
              <ChevronLeft size={34} color={colors.primary} />
            </TouchableOpacity>
            <Text className="text-primary-500 text-3xl font-extrabold ml-4">
              Ajouter un examen {`\n`} biologique
            </Text>
             <BioCategory/>
          </View>
        </View>

        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
          <ScrollView className="flex-1 p-6">
            <View className="gap-y-4">
              {/* Name/Type Input */}
              <View>
                <Text className="text-md font-medium text-gray-700 mb-1">
                  Nom / Type
                </Text>
                <View className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 h-14">
                  <User2 size={20} color={colors.text} className="opacity-50" />
                  <TextInput
                      value={formData.name}
                      onChangeText={(text) =>
                          setFormData((prev) => ({ ...prev, name: text }))
                      }
                      placeholder="Nom / Type"
                      placeholderTextColor="#9CA3AF"
                      className="flex-1 ml-3 text-md font-semibold"
                  />
                </View>
              </View>

              {/* Date Input */}
              <View>
                <Text className="text-md font-medium text-gray-700 mb-1">
                  Date de réalisation
                </Text>
                <TouchableOpacity
                    onPress={() => setShowDatePicker(!showDatePicker)}
                    className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 h-14"
                >
                  <Calendar size={20} color={colors.text} className="opacity-50" />
                  <Text className="flex-1 ml-3 text-md font-semibold text-gray-700">
                    {formData.date ? formatDate(formData.date) : "Sélectionner une date"}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                    <View className="z-10 mt-1 w-full bg-white rounded-xl shadow-lg">
                      <RNCalendar
                          onDayPress={(day) => {
                            setFormData(prev => ({ ...prev, date: day.dateString }));
                            setShowDatePicker(false);
                          }}
                          markedDates={{
                            [formData.date]: { selected: true, selectedColor: colors.primary }
                          }}
                          theme={{
                            backgroundColor: '#ffffff',
                            calendarBackground: '#ffffff',
                            textSectionTitleColor: colors.text,
                            selectedDayBackgroundColor: colors.primary,
                            selectedDayTextColor: '#ffffff',
                            todayTextColor: colors.primary,
                            dayTextColor: colors.text,
                            textDisabledColor: '#d9e1e8',
                            dotColor: colors.primary,
                            selectedDotColor: '#ffffff',
                            arrowColor: colors.text,
                            monthTextColor: colors.text,
                            indicatorColor: 'blue',
                            textDayFontFamily: 'System',
                            textMonthFontFamily: 'System',
                            textDayHeaderFontFamily: 'System',
                            textDayFontWeight: '300',
                            textMonthFontWeight: 'bold',
                            textDayHeaderFontWeight: '300',
                            textDayFontSize: 16,
                            textMonthFontSize: 16,
                            textDayHeaderFontSize: 16
                          }}
                      />
                    </View>
                )}
              </View>

              {/* Prescripteur Input */}
              <View>
                <Text className="text-md font-medium text-gray-700 mb-1">
                  Medecin prescripteur
                </Text>
                <View className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 h-14">
                  <User2 size={20} color={colors.text} className="opacity-50" />
                  <TextInput
                      value={formData.prescripteur}
                      onChangeText={(text) =>
                          setFormData((prev) => ({ ...prev, prescripteur: text }))
                      }
                      placeholder="Medecin prescripteur"
                      placeholderTextColor="#9CA3AF"
                      className="flex-1 ml-3 text-md font-semibold"
                  />
                </View>
              </View>

              {/* Laboratory Input */}
              <View>
                <Text className="text-md font-medium text-gray-700 mb-1">
                  Nom du Labo
                </Text>
                <View className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 h-14">
                  <Building2 size={20} color={colors.text} className="opacity-50" />
                  <TextInput
                      value={formData.laboratory}
                      onChangeText={(text) =>
                          setFormData((prev) => ({ ...prev, laboratory: text }))
                      }
                      placeholder="Nom du Labo"
                      placeholderTextColor="#9CA3AF"
                      className="flex-1 ml-3 text-md font-semibold"
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
                            <View key={index} className="relative">
                              {file.type === "image" ? (
                                  <Image
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
                                  hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                              >
                                <X size={12} color="white" />
                              </TouchableOpacity>
                            </View>
                        ))}
                      </ScrollView>
                  )}
                </View>
              </View>

              {/* Notes Input with Audio Recording */}
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
                      className="min-h-[100] mb-4 text-md font-semibold"
                      textAlignVertical="top"
                  />

                  {/* Audio Notes List */}
                  {audioNotes.length > 0 && (
                      <View className="mb-4">
                        {audioNotes.map((audio) => (
                            <View
                                key={audio.id}
                                className="flex-row items-center justify-between py-2 border-b border-gray-100"
                            >
                              <TouchableOpacity
                                  onPress={() => playPauseAudio(audio.id)}
                                  className="flex-row items-center flex-1"
                              >
                                <View className="w-8 h-8 rounded-full bg-indigo-100 items-center justify-center mr-3">
                                  {selectedAudioId === audio.id ? (
                                      <Pause size={16} color={colors.primary} />
                                  ) : (
                                      <Play size={16} color={colors.primary} />
                                  )}
                                </View>
                                <View className="flex-1">
                                  <Text className="text-sm text-gray-600">
                                    Note audio {audioNotes.indexOf(audio) + 1}
                                  </Text>
                                  <Text className="text-xs text-gray-400">
                                    {selectedAudioId === audio.id
                                        ? `${formatTime(
                                            audio.currentTime
                                        )} / ${formatTime(audio.duration)}`
                                        : formatTime(audio.duration)}
                                  </Text>
                                </View>
                              </TouchableOpacity>

                              <TouchableOpacity
                                  onPress={() =>
                                      setShowOptionsFor(
                                          showOptionsFor === audio.id ? null : audio.id
                                      )
                                  }
                                  className="p-2"
                              >
                                <MoreVertical size={20} color={colors.text} />
                              </TouchableOpacity>

                              {showOptionsFor === audio.id && (
                                  <TouchableOpacity
                                      onPress={() => deleteAudio(audio.id)}
                                      className="absolute right-10 top-2 bg-white shadow-lg rounded-lg p-2"
                                  >
                                    <View className="flex-row items-center">
                                      <Trash size={16} color="red" />
                                      <Text className="ml-2 text-red-500">Supprimer</Text>
                                    </View>
                                  </TouchableOpacity>
                              )}
                            </View>
                        ))}
                      </View>
                  )}

                  {/* Recording Button */}
                  <TouchableOpacity
                      onPress={isRecording ? stopRecording : startRecording}
                      className="flex-row items-center"
                  >
                    <View
                        className={`w-10 h-10 rounded-full ${
                            isRecording ? "bg-red-500" : "bg-gray-100"
                        } items-center justify-center mr-2`}
                    >
                      <Mic
                          size={20}
                          color={isRecording ? "white" : colors.primary}
                      />
                    </View>
                    <Text className="text-sm text-gray-600">
                      {isRecording
                          ? "Arrêter l'enregistrement"
                          : "Enregistrer une note audio"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        <View className="p-6 bg-white border-t border-gray-200">
          <TouchableOpacity
              onPress={handleSubmit}
              className="w-full bg-indigo-600 rounded-xl py-3 items-center"
          >
            <Text className="text-white font-semibold text-xl">
              {isLoading ? "Chargement..." : "Enregistrer"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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

