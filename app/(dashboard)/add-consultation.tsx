'use client'

import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    FlatList,
    Alert,
    TouchableWithoutFeedback,
    Switch,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native";
import {
    ChevronLeft,
    Calendar,
    FileText,
    User2,
    MapPin,
    Building2,
    FileUp,
    Mic,
    Play,
    Pause,
    MoreVertical,
    Trash,
    X,
    Stethoscope,
    ChevronDown,
    ImageIcon,
    Upload
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { supabase } from "@/utils/supabase";
import { Calendar as RNCalendar, LocaleConfig } from 'react-native-calendars';
import { Audio } from 'expo-av';
import ConsultationCategory from "@/assets/images/consultationsCategory.svg";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { decode as atob } from "base-64";

// Configure French locale
LocaleConfig.locales['fr'] = {
    monthNames: ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
    monthNamesShort: ['Janv.','Févr.','Mars','Avril','Mai','Juin','Juil.','Août','Sept.','Oct.','Nov.','Déc.'],
    dayNames: ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'],
    dayNamesShort: ['Dim.','Lun.','Mar.','Mer.','Jeu.','Ven.','Sam.'],
    today: "Aujourd'hui"
};
LocaleConfig.defaultLocale = 'fr';

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

interface Specialty {
    id: number;
    name: string;
    hexColor: string;
}

export default function AddConsultation() {
    const router = useRouter();
    const { colors } = useTheme();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        doctorName: "",
        speciality: null as number | null,
        date: "",
        adress: "",
        city: "",
        notes: "",
        reminder: false,
        nextConsultationDate: "",
        nextConsultationDateReminder: "",
        files: [] as UploadedFile[],
    });

    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [audioNotes, setAudioNotes] = useState<AudioNote[]>([]);
    const [selectedAudioId, setSelectedAudioId] = useState<string | null>(null);
    const [showOptionsFor, setShowOptionsFor] = useState<string | null>(null);

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showNextAppointmentPicker, setShowNextAppointmentPicker] = useState(false);
    const [showNextConsultationDatePicker, setShowNextConsultationDatePicker] = useState(false);
    const [specialties, setSpecialties] = useState<Specialty[]>([]);
    const [showSpecialtyPicker, setShowSpecialtyPicker] = useState(false);
    const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null);
    const [specialtySearch, setSpecialtySearch] = useState("");

    const specialtyInputRef = useRef(null);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const handleTimeConfirm = (time: Date) => {
        if ( formData.nextConsultationDateReminder) {
            const [year, month, day] = formData.nextConsultationDateReminder.split('-');
            const nextAppointmentDate = new Date(
                parseInt(year),
                parseInt(month) - 1,
                parseInt(day),
                time.getHours(),
                time.getMinutes()
            );
            setFormData(prev => ({
                ...prev,
                nextConsultationDateReminder: nextAppointmentDate.toISOString(),
            }));
        }
        setShowTimePicker(false);
    };

    useEffect(() => {
        fetchSpecialties();
        return () => {
            if (recording) {
                recording.stopAndUnloadAsync();
            }
            audioNotes.forEach(note => {
                if (note.sound) {
                    note.sound.unloadAsync();
                }
            });
        };
    }, []);

    const fetchSpecialties = async () => {
        try {
            const { data, error } = await supabase
                .from('specialties')
                .select('*')
                .order('name');

            if (error) throw error;
            if (data) setSpecialties(data);
        } catch (error) {
            console.error('Error fetching specialties:', error);
            Alert.alert('Erreur', 'Impossible de charger les spécialités');
        }
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
            console.error('Failed to start recording', err);
            Alert.alert('Erreur', 'Impossible de démarrer l\'enregistrement');
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
            setAudioNotes(prev => [...prev, newAudioNote]);
        }
        setRecording(null);
    };

    const playPauseAudio = async (audioId: string) => {
        const audioNote = audioNotes.find(note => note.id === audioId);
        if (!audioNote?.sound) return;

        if (selectedAudioId === audioId) {
            await audioNote.sound.pauseAsync();
            setSelectedAudioId(null);
        } else {
            if (selectedAudioId) {
                const playingNote = audioNotes.find(note => note.id === selectedAudioId);
                if (playingNote?.sound) {
                    await playingNote.sound.stopAsync();
                }
            }
            await audioNote.sound.playAsync();
            setSelectedAudioId(audioId);

            audioNote.sound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded) {
                    setAudioNotes(prev => prev.map(note =>
                        note.id === audioId
                            ? { ...note, currentTime: status.positionMillis ?? 0 }
                            : note
                    ));
                    if (status.didJustFinish) {
                        setSelectedAudioId(null);
                    }
                }
            });
        }
    };

    const deleteAudio = async (audioId: string) => {
        const audioNote = audioNotes.find(note => note.id === audioId);
        if (audioNote?.sound) {
            await audioNote.sound.unloadAsync();
        }
        setAudioNotes(prev => prev.filter(note => note.id !== audioId));
        setShowOptionsFor(null);
    };

    const formatTime = (milliseconds: number): string => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
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
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
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

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: "application/pdf",
            });

            if (result.assets && result.assets[0]) {
                const newFile: UploadedFile = {
                    uri: result.assets[0].uri,
                    type: "document",
                    name: result.assets[0].name,
                };
                setFormData(prev => ({
                    ...prev,
                    files: [...prev.files, newFile],
                }));
            }
        } catch (error) {
            console.error('Error picking document:', error);
            Alert.alert('Erreur', 'Impossible de sélectionner le document');
        }
    };

    const deleteFile = (index: number) => {
        setFormData(prev => ({
            ...prev,
            files: prev.files.filter((_, i) => i !== index)
        }));
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "Sélectionner une date";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                // If it's not an ISO string, try splitting by dash
                const [year, month, day] = dateString.split("-");
                return `${day}-${month}-${year}`;
            }
            // Format the ISO date
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
        } catch {
            return "Date invalide";
        }
    };

    const handleSubmit = async () => {
        if (!formData.doctorName || !formData.speciality || !formData.date) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
            return;
        }

        setIsLoading(true);

        try {
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;

            const userId = userData?.user?.id;
            if (!userId) throw new Error("No user id found");

            // First, create the consultation record
            const { data, error } = await supabase
                .from("consultations")
                .insert({
                    doctorName: formData.doctorName,
                    speciality: formData.speciality,
                    date: new Date(formData.date).toISOString(),
                    adress: formData.adress,
                    city: formData.city,
                    note: formData.notes,
                    reminder: formData.reminder,
                    nextConsultationDateReminder: formData.nextConsultationDateReminder ? new Date(formData.nextConsultationDateReminder).toISOString() : null,
                    nextConsultationDate: formData.nextConsultationDate ? new Date(formData.nextConsultationDate).toISOString() : null,
                    created_at: new Date().toISOString(),
                    user_id: userId,
                })
                .select();

            if (error) throw error;

            // Handle file uploads
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
                        .from("consultations")
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

            // Handle audio note uploads
            const audioFilePaths = [];
            for (let audio of audioNotes) {
                try {
                    let fileExtension = audio.uri.split(".").pop();
                    let filePath = `${userId}/${Date.now()}_${fileExtension}`;
                    console.log("Uploading audio to path:", filePath);

                    const response = await fetch(audio.uri);
                    const blob = await response.blob();

                    const reader = new FileReader();
                    const base64Promise = new Promise((resolve) => {
                        reader.onload = () => resolve(reader.result);
                    });
                    reader.readAsDataURL(blob);

                    const base64Data = await base64Promise;
                    const base64String = String(base64Data).split(",")[1];

                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from("consultations")
                        .upload(filePath, decode(base64String), {
                            contentType: blob.type,
                            upsert: false,
                        });

                    if (uploadError) {
                        console.error("Upload error:", uploadError);
                    } else {
                        console.log("Audio file uploaded successfully:", uploadData);
                        audioFilePaths.push(uploadData.path);
                    }
                } catch (error) {
                    console.error("Error processing audio file:", error, "for file:", audio.id);
                }
            }

            // Update the consultation record with file paths
            if (supabaseFilePaths.length > 0 || audioFilePaths.length > 0) {
                const { error: updateError } = await supabase
                    .from("consultations")
                    .update({
                        uploads: supabaseFilePaths,
                        audio_notes: audioFilePaths
                    })
                    .eq("id", data[0].id);

                if (updateError) {
                    console.error("Error updating consultation:", updateError);
                }
            }

            setIsLoading(false);
            Alert.alert("Succès", "Consultation ajoutée avec succès");
            router.push("/list-consultations");
        } catch (error) {
            console.error("Error:", error);
            Alert.alert("Erreur", "Échec de l'enregistrement de la consultation");
            setIsLoading(false);
        }
    };

    const filteredSpecialties = specialties.filter(specialty =>
        specialty.name.toLowerCase().includes(specialtySearch.toLowerCase())
    );

    const renderSpecialtyPicker = () => (
        <View className="absolute z-10 top-full left-0 right-0 bg-white rounded-b-xl shadow-lg max-h-48">
            <FlatList
                data={filteredSpecialties}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => {
                            setSelectedSpecialty(item);
                            setFormData(prev => ({ ...prev, speciality: item.id }));
                            setShowSpecialtyPicker(false);
                            setSpecialtySearch("");
                        }}
                        className="p-3 border-b border-gray-200"
                    >
                        <View style={{ backgroundColor: item.hexColor }} className="px-3 py-1 rounded-full self-start">
                            <Text className="text-white font-medium">{item.name}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    );

    return (
        <View className="flex-1 bg-gray-50 pt-4">
            <View className="px-6 pt-14 pb-2 bg-white">
                <View className="flex-row items-start">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
                    >
                        <ChevronLeft size={34} color={colors.primary} />
                    </TouchableOpacity>
                    <Text className="text-primary-500 text-3xl font-extrabold ml-4">
                        Ajouter {'\n'} une consultation
                    </Text>
                    <ConsultationCategory/>
                </View>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
            >
                <ScrollView className="flex-1 p-6">
                    <View className="gap-y-4">
                        {/* Doctor Name Input */}
                        <View>
                            <Text className="text-md font-medium text-gray-700 mb-1">
                                Nom du médecin
                            </Text>
                            <View className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 h-14">
                                <User2 size={20} color={colors.text} className="opacity-50" />
                                <TextInput
                                    value={formData.doctorName}
                                    onChangeText={(text) =>
                                        setFormData((prev) => ({ ...prev, doctorName: text }))
                                    }
                                    placeholder="Nom du médecin"
                                    placeholderTextColor="#9CA3AF"
                                    className="flex-1 ml-3 text-md font-semibold"
                                />
                            </View>
                        </View>

                        {/* Specialty Selector */}
                        <View>
                            <Text className="text-md font-medium text-gray-700 mb-1">
                                Spécialité
                            </Text>
                            <View className="relative">
                                <TouchableOpacity
                                    ref={specialtyInputRef}
                                    onPress={() => setShowSpecialtyPicker(!showSpecialtyPicker)}
                                    className="relative flex-row items-center justify-between bg-white rounded-xl border border-gray-200 px-4 h-14"
                                >
                                    <View className="flex-row items-center flex-1">
                                        <Stethoscope size={20} color={colors.text} className="opacity-50" />
                                        {selectedSpecialty ? (
                                            <View style={{ backgroundColor: selectedSpecialty.hexColor }} className="px-3 py-1 rounded-full ml-3">
                                                <Text className="text-white font-medium">{selectedSpecialty.name}</Text>
                                            </View>
                                        ) : (
                                            <TextInput
                                                value={specialtySearch}
                                                onChangeText={(text) => {
                                                    setSpecialtySearch(text);
                                                    setShowSpecialtyPicker(true);
                                                }}
                                                placeholder="Rechercher une spécialité"
                                                placeholderTextColor="#9CA3AF"
                                                className="flex-1 ml-3 text-md font-semibold"
                                            />
                                        )}
                                    </View>
                                    <ChevronDown size={20} color={colors.text} className="opacity-50" />
                                </TouchableOpacity>
                                {showSpecialtyPicker && renderSpecialtyPicker()}
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
                                <Text className="flex-1 ml-3 text-gray-700">
                                    {formatDate(formData.date)}
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

                        {/* Address Input */}
                        <View>
                            <Text className="text-md font-medium text-gray-700 mb-1">
                                Lieu de réalisation
                            </Text>
                            <View className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 h-14">
                                <MapPin size={20} color={colors.text} className="opacity-50" />
                                <TextInput
                                    value={formData.adress}
                                    onChangeText={(text) =>
                                        setFormData((prev) => ({ ...prev, adress: text }))
                                    }
                                    placeholder="Adresse"
                                    placeholderTextColor="#9CA3AF"
                                    className="flex-1 ml-3 text-md font-semibold"
                                />
                            </View>
                        </View>

                        {/* City Input */}
                        <View>
                            <Text className="text-md font-medium text-gray-700 mb-1">
                                Ville
                            </Text>
                            <View className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 h-14">
                                <Building2 size={20} color={colors.text} className="opacity-50" />
                                <TextInput
                                    value={formData.city}
                                    onChangeText={(text) =>
                                        setFormData((prev) => ({ ...prev, city: text }))
                                    }
                                    placeholder="Ville"
                                    placeholderTextColor="#9CA3AF"
                                    className="flex-1 ml-3 text-md font-semibold"
                                />
                            </View>
                        </View>

                        {/* Date de la prochaine consultation */}
                        <View className="mt-4">
                            <Text className="text-md font-medium text-gray-700 mb-1">
                                Date de la prochaine consultation
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowNextConsultationDatePicker(!showNextConsultationDatePicker)}
                                className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 h-14"
                            >
                                <Calendar size={20} color={colors.text} className="opacity-50" />
                                <Text className="flex-1 ml-3 text-gray-700">
                                    {formData.nextConsultationDate
                                        ? formatDate(formData.nextConsultationDate)
                                        : "Sélectionnez une date"}
                                </Text>
                            </TouchableOpacity>
                            {showNextConsultationDatePicker && (
                                <View className="z-10 mt-1 w-full bg-white rounded-xl shadow-lg">
                                    <RNCalendar
                                        onDayPress={(day) => {
                                            setFormData((prev) => ({ ...prev, nextConsultationDate: day.dateString }));
                                            setShowNextConsultationDatePicker(false);
                                        }}
                                        markedDates={{
                                            [formData.nextConsultationDate]: {
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

                                    {/* Reminder Section */}
                                    <View>
                                        <Text className="text-md font-medium text-gray-700 mb-1">
                                            Rappel pour la prochaine consultation
                                        </Text>
                                        <View className="bg-white rounded-xl border border-gray-200 p-4">
                                            <View className="flex-row items-center justify-between mb-4">
                                                <Text className="text-gray-700">Activer le rappel</Text>
                                                <Switch
                                                    value={formData.reminder}
                                                    onValueChange={(value) =>
                                                        setFormData((prev) => ({ ...prev, reminder: value }))
                                                    }
                                                />
                                            </View>
                                            {formData.reminder && (
                                                <TouchableOpacity
                                                    onPress={() => setShowNextAppointmentPicker(!showNextAppointmentPicker)}
                                                    className="flex-row items-center bg-gray-100 rounded-xl px-4 h-12"
                                                >
                                                    <Calendar size={20} color={colors.text} className="opacity-50" />
                                                    <Text className="flex-1 ml-3 text-gray-700">
                                                        {formData.nextConsultationDateReminder ? formatDate(formData.nextConsultationDateReminder) : "Date du prochain rendez-vous"}
                                                    </Text>
                                                </TouchableOpacity>
                                            )}
                                            {showNextAppointmentPicker && (
                                                <View className="z-10 mt-1 w-full bg-white rounded-xl shadow-lg">
                                                    <RNCalendar
                                                        onDayPress={(day) => {
                                                            setFormData(prev => ({ ...prev, nextConsultationDateReminder: day.dateString }));
                                                            setShowNextAppointmentPicker(false);
                                                            setShowTimePicker(true)
                                                        }}
                                                        markedDates={{
                                                            [formData.nextConsultationDateReminder]: { selected: true, selectedColor: colors.primary }
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

                                            <DateTimePickerModal
                                                isVisible={showTimePicker}
                                                mode="time"
                                                onConfirm={handleTimeConfirm}
                                                onCancel={() => setShowTimePicker(false)}
                                                locale="fr"
                                                cancelTextIOS="Annuler"
                                                confirmTextIOS="Confirmer"
                                                is24Hour={true}
                                                themeVariant="light"
                                                accentColor={colors.primary}
                                                buttonTextColorIOS={colors.primary}
                                                // Android specific props
                                                display={Platform.OS === 'android' ? 'default' : undefined}
                                                textColor={Platform.OS === 'android' ? colors.text : undefined}
                                                positiveButton={{label: 'Ok', textColor: 'green'}}
                                                negativeButton={{label: 'Annuler', textColor: 'red'}}
                                            />
                                            {/* Display selected date and time */}
                                            {formData.nextConsultationDateReminder && (
                                                <Text className="pl-2 pt-2">
                                                    La prochaine consultation: {new Date(formData.nextConsultationDateReminder).toLocaleString('fr-FR', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                                </Text>
                                            )}
                                        </View>
                                    </View>

                                    {/* File Upload Section */}
                                    <View>
                                        <Text className="text-md font-medium text-gray-700 mb-1">
                                            Documents
                                        </Text>
                                        <View className="bg-white rounded-xl border border-gray-200 p-4">
                                            <View className="flex-row justify-around mb-4">
                                                <TouchableOpacity onPress={pickImage} className="items-center">
                                                    <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mb-2">
                                                        <ImageIcon size={24} color={colors.primary} />
                                                    </View>
                                                    <Text className="text-md text-gray-600">Galerie</Text>
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                    onPress={takePicture}
                                                    className="items-center"
                                                >
                                                    <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mb-2">
                                                        <Upload size={24} color={colors.primary} />
                                                    </View>
                                                    <Text className="text-md text-gray-600">Camera</Text>
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                    onPress={pickDocument}
                                                    className="items-center"
                                                >
                                                    <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mb-2">
                                                        <FileText size={24} color={colors.primary} />
                                                    </View>
                                                    <Text className="text-md text-gray-600">Document</Text>
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
                                        <Text className="text-md font-medium text-gray-700 mb-1">Notes</Text>
                                        <View className="bg-white rounded-xl border border-gray-200 p-4">
                                            <TextInput
                                                value={formData.notes}
                                                onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
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
                                                        <View key={audio.id} className="flex-row items-center justify-between py-2 border-b border-gray-100">
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
                                                                    <Text className="text-md text-gray-600">
                                                                        Note audio {audioNotes.indexOf(audio) + 1}
                                                                    </Text>
                                                                    <Text className="text-xs text-gray-400">
                                                                        {selectedAudioId === audio.id
                                                                            ? `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`
                                                                            : formatTime(audio.duration)}
                                                                    </Text>
                                                                </View>
                                                            </TouchableOpacity>

                                                            <TouchableOpacity
                                                                onPress={() => setShowOptionsFor(showOptionsFor === audio.id ? null : audio.id)}
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
                                                <View className={`w-10 h-10 rounded-full ${isRecording ? 'bg-red-500' : 'bg-gray-100'} items-center justify-center mr-2`}>
                                                    <Mic size={20} color={isRecording ? 'white' : colors.primary} />
                                                </View>
                                                <Text className="text-md text-gray-600">
                                                    {isRecording ? 'Arrêter l\'enregistrement' : 'Enregistrer une note audio'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            )}
                        </View>

                        {/* Reminder Section */}
                        <View>
                            <Text className="text-md font-medium text-gray-700 mb-1">
                                Rappel pour la prochaine consultation
                            </Text>
                            <View className="bg-white rounded-xl border border-gray-200 p-4">
                                <View className="flex-row items-center justify-between mb-4">
                                    <Text className="text-gray-700">Activer le rappel</Text>
                                    <Switch
                                        value={formData.reminder}
                                        onValueChange={(value) =>
                                            setFormData((prev) => ({ ...prev, reminder: value }))
                                        }
                                    />
                                </View>
                                {formData.reminder && (
                                    <TouchableOpacity
                                        onPress={() => setShowNextAppointmentPicker(!showNextAppointmentPicker)}
                                        className="flex-row items-center bg-gray-100 rounded-xl px-4 h-12"
                                    >
                                        <Calendar size={20} color={colors.text} className="opacity-50" />
                                        <Text className="flex-1 ml-3 text-gray-700">
                                            {formData.nextConsultationDateReminder
                                                ? formatDate(formData.nextConsultationDateReminder) : "Date du prochain rendez-vous"}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                                {showNextAppointmentPicker && (
                                    <View className="z-10 mt-1 w-full bg-white rounded-xl shadow-lg">
                                        <RNCalendar
                                            onDayPress={(day) => {
                                                setFormData(prev => ({ ...prev, nextConsultationDateReminder: day.dateString }));
                                                setShowNextAppointmentPicker(false);
                                                setShowTimePicker(true)
                                            }}
                                            markedDates={{
                                                [formData.nextConsultationDateReminder]: { selected: true, selectedColor: colors.primary }
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

                                <DateTimePickerModal
                                    isVisible={showTimePicker}
                                    mode="time"
                                    onConfirm={handleTimeConfirm}
                                    onCancel={() => setShowTimePicker(false)}
                                    locale="fr"
                                    cancelTextIOS="Annuler"
                                    confirmTextIOS="Confirmer"
                                    is24Hour={true}
                                    themeVariant="light"
                                    accentColor={colors.primary}
                                    buttonTextColorIOS={colors.primary}
                                    // Android specific props
                                    display={Platform.OS === 'android' ? 'default' : undefined}
                                    textColor={Platform.OS === 'android' ? colors.text : undefined}
                                    positiveButton={{label: 'Ok', textColor: 'green'}}
                                    negativeButton={{label: 'Annuler', textColor: 'red'}}
                                />
                                {/* Display selected date and time */}
                                {formData.nextConsultationDateReminder && (
                                    <Text className="pl-2 pt-2">
                                        La prochaine consultation: {new Date(formData.nextConsultationDateReminder).toLocaleString('fr-FR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                    </Text>
                                )}
                            </View>
                        </View>

                        {/* File Upload Section */}
                        <View>
                            <Text className="text-md font-medium text-gray-700 mb-1">
                                Documents
                            </Text>
                            <View className="bg-white rounded-xl border border-gray-200 p-4">
                                <View className="flex-row justify-around mb-4">
                                    <TouchableOpacity onPress={pickImage} className="items-center">
                                        <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mb-2">
                                            <ImageIcon size={24} color={colors.primary} />
                                        </View>
                                        <Text className="text-md text-gray-600">Galerie</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={takePicture}
                                        className="items-center"
                                    >
                                        <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mb-2">
                                            <Upload size={24} color={colors.primary} />
                                        </View>
                                        <Text className="text-md text-gray-600">Camera</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={pickDocument}
                                        className="items-center"
                                    >
                                        <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mb-2">
                                            <FileText size={24} color={colors.primary} />
                                        </View>
                                        <Text className="text-md text-gray-600">Document</Text>
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
                            <Text className="text-md font-medium text-gray-700 mb-1">Notes</Text>
                            <View className="bg-white rounded-xl border border-gray-200 p-4">
                                <TextInput
                                    value={formData.notes}
                                    onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
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
                                            <View key={audio.id} className="flex-row items-center justify-between py-2 border-b border-gray-100">
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
                                                        <Text className="text-md text-gray-600">
                                                            Note audio {audioNotes.indexOf(audio) + 1}
                                                        </Text>
                                                        <Text className="text-xs text-gray-400">
                                                            {selectedAudioId === audio.id
                                                                ? `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`
                                                                : formatTime(audio.duration)}
                                                        </Text>
                                                    </View>
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                    onPress={() => setShowOptionsFor(showOptionsFor === audio.id ? null : audio.id)}
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
                                    <View className={`w-10 h-10 rounded-full ${isRecording ? 'bg-red-500' : 'bg-gray-100'} items-center justify-center mr-2`}>
                                        <Mic size={20} color={isRecording ? 'white' : colors.primary} />
                                    </View>
                                    <Text className="text-md text-gray-600">
                                        {isRecording ? 'Arrêter l\'enregistrement' : 'Enregistrer une note audio'}
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
                    disabled={isLoading}
                    className={`w-full rounded-xl py-3 items-center ${
                        isLoading ? "bg-indigo-400" : "bg-indigo-600"
                    }`}
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

