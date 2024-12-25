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
    Edit2,
    Save
} from "lucide-react-native";
import * as DocumentPicker from "expo-document-picker";
import { supabase } from "@/utils/supabase";
import { Calendar as RNCalendar, LocaleConfig } from 'react-native-calendars';
import { Audio } from 'expo-av';

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
    name: string;
}

interface Specialty {
    id: number;
    name: string;
    hexColor: string;
}

interface ConsultationDetailsProps {
    consultation: Consultation;
}
interface Consultation {
    id: number;
    doctorName: string;
    speciality: number;
    date: string;
    adress: string;
    city: string;
    note: string | null;
    reminder: boolean;
    nextAppointment: string | null;
    uploads: string[] | null;
    audio_notes: string[] | null;
    created_at: string;
    user_id: string;
    specialties: {
        name: string;
        hexColor: string;
    };
}

export default function ConsultationDetails({ consultation: initialConsultation }: ConsultationDetailsProps) {
    const router = useRouter();
    const { colors } = useTheme();
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [consultation, setConsultation] = useState(initialConsultation);

    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [audioNotes, setAudioNotes] = useState<AudioNote[]>([]);
    const [selectedAudioId, setSelectedAudioId] = useState<string | null>(null);
    const [showOptionsFor, setShowOptionsFor] = useState<string | null>(null);

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showNextAppointmentPicker, setShowNextAppointmentPicker] = useState(false);
    const [specialties, setSpecialties] = useState<Specialty[]>([]);
    const [showSpecialtyPicker, setShowSpecialtyPicker] = useState(false);
    const [specialtySearch, setSpecialtySearch] = useState("");

    const specialtyInputRef = useRef(null);

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

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: "application/pdf",
            });

            if (result.assets && result.assets[0]) {
                setConsultation((prev: any) => ({
                    ...prev,
                    uploads: [...(prev.uploads || []), result.assets[0].uri],
                }));
            }
        } catch (error) {
            console.error('Error picking document:', error);
            Alert.alert('Erreur', 'Impossible de sélectionner le document');
        }
    };

    const deleteFile = (index: number) => {
        setConsultation((prev: any) => ({
            ...prev,
            uploads: prev.uploads ? prev.uploads.filter((_: any, i: any) => i !== index) : []
        }));
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "Sélectionner une date";
        const [year, month, day] = dateString.split("-");
        return `${day}-${month}-${year}`;
    };

    const handleUpdate = async () => {
        setIsLoading(true);
        try {
            const { error } = await supabase
                .from("consultations")
                .update({
                    doctorName: consultation.doctorName,
                    speciality: consultation.speciality,
                    date: consultation.date,
                    adress: consultation.adress,
                    city: consultation.city,
                    note: consultation.note,
                    reminder: consultation.reminder,
                    nextAppointment: consultation.nextAppointment,
                    uploads: consultation.uploads,
                    audio_notes: audioNotes.map(note => note.uri),
                })
                .eq("id", consultation.id);

            if (error) throw error;

            Alert.alert("Succès", "Consultation mise à jour avec succès");
            setIsEditing(false);
            router.push('/list-consultations');
        } catch (error) {
            console.error("Error:", error);
            Alert.alert("Erreur", "Échec de la mise à jour de la consultation");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        Alert.alert(
            "Confirmer la suppression",
            "Êtes-vous sûr de vouloir supprimer cette consultation ?",
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Supprimer",
                    style: "destructive",
                    onPress: async () => {
                        setIsLoading(true);
                        try {
                            const { error } = await supabase
                                .from("consultations")
                                .delete()
                                .eq("id", consultation.id);

                            if (error) throw error;

                            Alert.alert("Succès", "Consultation supprimée avec succès");
                            router.back();
                        } catch (error) {
                            console.error("Error:", error);
                            Alert.alert("Erreur", "Échec de la suppression de la consultation");
                        } finally {
                            setIsLoading(false);
                        }
                    }
                }
            ]
        );
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
                            setConsultation((prev: any) => ({ ...prev, speciality: item.id }));
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
        <TouchableWithoutFeedback onPress={() => {
            setShowDatePicker(false);
            setShowNextAppointmentPicker(false);
            setShowSpecialtyPicker(false);
        }}>
            <View className="flex-1 bg-gray-50">
                <FlatList
                    data={[1]}
                    renderItem={() => (
                        <View className="space-y-4 p-6">
                            <View className="px-6 pt-14 pb-6 bg-white">
                                <View className="flex-row items-center justify-between">
                                    <TouchableOpacity
                                        onPress={() => router.back()}
                                        className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
                                    >
                                        <ChevronLeft size={24} color={colors.text} />
                                    </TouchableOpacity>
                                    <Text className="font-bold text-xl font-semibold text-gray-900">
                                        Détails de la consultation
                                    </Text>
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
                                                    onPress={handleDelete}
                                                    className="w-10 h-10 items-center justify-center rounded-full bg-red-100"
                                                >
                                                    <Trash size={20} color="rgb(220 38 38)" />
                                                </TouchableOpacity>
                                            </>
                                        ) : (
                                            <TouchableOpacity
                                                onPress={handleUpdate}
                                                className="px-4 py-2 bg-primary rounded-lg"
                                            >
                                                <Text className="text-white font-medium">Enregistrer</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            </View>

                            {/* Doctor Name Input */}
                            <View>
                                <Text className="text-sm font-medium text-gray-700 mb-1">
                                    Nom du médecin
                                </Text>
                                <View className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 h-12">
                                    <User2 size={20} color={colors.text} className="opacity-50" />
                                    <TextInput
                                        value={consultation.doctorName}
                                        onChangeText={(text) =>
                                            setConsultation((prev: any) => ({ ...prev, doctorName: text }))
                                        }
                                        placeholder="Nom du médecin"
                                        placeholderTextColor="#9CA3AF"
                                        className="flex-1 ml-3"
                                        editable={isEditing}
                                    />
                                </View>
                            </View>

                            {/* Specialty Selector */}
                            <View>
                                <Text className="text-sm font-medium text-gray-700 mb-1">
                                    Spécialité
                                </Text>
                                <View className="relative">
                                    <TouchableOpacity
                                        ref={specialtyInputRef}
                                        onPress={() => isEditing && setShowSpecialtyPicker(!showSpecialtyPicker)}
                                        className="relative flex-row items-center justify-between bg-white rounded-xl border border-gray-200 px-4 h-12"
                                    >
                                        <View className="flex-row items-center flex-1">
                                            <Stethoscope size={20} color={colors.text} className="opacity-50" />
                                            {consultation.specialties ? (
                                                <View style={{ backgroundColor: consultation.specialties.hexColor }} className="px-3 py-1 rounded-full ml-3">
                                                    <Text className="text-white font-medium">{consultation.specialties.name}</Text>
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
                                                    className="flex-1 ml-3"
                                                    editable={isEditing}
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
                                <Text className="text-sm font-medium text-gray-700 mb-1">
                                    Date de réalisation
                                </Text>
                                <TouchableOpacity
                                    onPress={() => isEditing && setShowDatePicker(!showDatePicker)}
                                    className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 h-12"
                                >
                                    <Calendar size={20} color={colors.text} className="opacity-50" />
                                    <Text className="flex-1 ml-3 text-gray-700">
                                        {formatDate(consultation.date)}
                                    </Text>
                                </TouchableOpacity>
                                {showDatePicker && (
                                    <View className="z-10 mt-1 w-full bg-white rounded-xl shadow-lg">
                                        <RNCalendar
                                            onDayPress={(day) => {
                                                setConsultation((prev :any )=> ({ ...prev, date: day.dateString }));
                                                setShowDatePicker(false);
                                            }}
                                            markedDates={{
                                                [consultation.date]: { selected: true, selectedColor: colors.primary }
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
                                <Text className="text-sm font-medium text-gray-700 mb-1">
                                    Lieu de réalisation
                                </Text>
                                <View className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 h-12">
                                    <MapPin size={20} color={colors.text} className="opacity-50" />
                                    <TextInput
                                        value={consultation.adress}
                                        onChangeText={(text) =>
                                            setConsultation((prev: any) => ({ ...prev, adress: text }))
                                        }
                                        placeholder="Adresse"
                                        placeholderTextColor="#9CA3AF"
                                        className="flex-1 ml-3"
                                        editable={isEditing}
                                    />
                                </View>
                            </View>

                            {/* City Input */}
                            <View>
                                <Text className="text-sm font-medium text-gray-700 mb-1">
                                    Ville
                                </Text>
                                <View className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 h-12">
                                    <Building2 size={20} color={colors.text} className="opacity-50" />
                                    <TextInput
                                        value={consultation.city}
                                        onChangeText={(text) =>
                                            setConsultation((prev: any) => ({ ...prev, city: text }))
                                        }
                                        placeholder="Ville"
                                        placeholderTextColor="#9CA3AF"
                                        className="flex-1 ml-3"
                                        editable={isEditing}
                                    />
                                </View>
                            </View>

                            {/* Reminder Section */}
                            <View>
                                <Text className="text-sm font-medium text-gray-700 mb-1">
                                    Rappel pour la prochaine consultation
                                </Text>
                                <View className="bg-white rounded-xl border border-gray-200 p-4">
                                    <View className="flex-row items-center justify-between mb-4">
                                        <Text className="text-gray-700">Activer le rappel</Text>
                                        <Switch
                                            value={consultation.reminder}
                                            onValueChange={(value) =>
                                                setConsultation((prev : any) => ({ ...prev, reminder: value }))
                                            }
                                            disabled={!isEditing}
                                        />
                                    </View>
                                    {consultation.reminder && (
                                        <TouchableOpacity
                                            onPress={() => isEditing && setShowNextAppointmentPicker(!showNextAppointmentPicker)}
                                            className="flex-row items-center bg-gray-100 rounded-xl px-4 h-12"
                                        >
                                            <Calendar size={20} color={colors.text} className="opacity-50" />
                                            <Text className="flex-1 ml-3 text-gray-700">
                                                {formatDate(consultation.nextAppointment!) || "Date du prochain rendez-vous"}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                    {showNextAppointmentPicker && (
                                        <View className="z-10 mt-1 w-full bg-white rounded-xl shadow-lg">
                                            <RNCalendar
                                                onDayPress={(day) => {
                                                    setConsultation((prev: any )=> ({ ...prev, nextAppointment: day.dateString }));
                                                    setShowNextAppointmentPicker(false);
                                                }}
                                                markedDates={{
                                                    [consultation.nextAppointment!]: { selected: true, selectedColor: colors.primary }
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
                            </View>

                            {/* Notes Input */}
                            <View>
                                <Text className="text-sm font-medium text-gray-700 mb-1">Notes</Text>
                                <View className="bg-white rounded-xl border border-gray-200 p-4">
                                    <TextInput
                                        value={consultation.note!}
                                        onChangeText={(text) => setConsultation((prev : any)  => ({ ...prev, note: text }))}
                                        placeholder="Ajouter des notes..."
                                        placeholderTextColor="#9CA3AF"
                                        multiline
                                        numberOfLines={4}
                                        className="min-h-[100] mb-4"
                                        textAlignVertical="top"
                                        editable={isEditing}
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
                                                            <Text className="text-sm text-gray-600">
                                                                Note audio {audioNotes.indexOf(audio) + 1}
                                                            </Text>
                                                            <Text className="text-xs text-gray-400">
                                                                {selectedAudioId === audio.id
                                                                    ? `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`
                                                                    : formatTime(audio.duration)}
                                                            </Text>
                                                        </View>
                                                    </TouchableOpacity>

                                                    {isEditing && (
                                                        <TouchableOpacity
                                                            onPress={() => setShowOptionsFor(showOptionsFor === audio.id ? null : audio.id)}
                                                            className="p-2"
                                                        >
                                                            <MoreVertical size={20} color={colors.text} />
                                                        </TouchableOpacity>
                                                    )}

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
                                    {isEditing && (
                                        <TouchableOpacity
                                            onPress={isRecording ? stopRecording : startRecording}
                                            className="flex-row items-center"
                                        >
                                            <View className={`w-10 h-10 rounded-full ${isRecording ? 'bg-red-500' : 'bg-gray-100'} items-center justify-center mr-2`}>
                                                <Mic size={20} color={isRecording ? 'white' : colors.primary} />
                                            </View>
                                            <Text className="text-sm text-gray-600">
                                                {isRecording ? 'Arrêter l\'enregistrement' : 'Enregistrer une note audio'}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>

                            {/* File Upload Section */}
                            <View>
                                <Text className="text-sm font-medium text-gray-700 mb-1">
                                    Documents
                                </Text>
                                <View className="bg-white rounded-xl border border-gray-200 p-4">
                                    {consultation.uploads && consultation.uploads.length > 0 ? (
                                        <View className="mt-4 space-y-2">
                                            {consultation.uploads.map((file: any, index: any) => (
                                                <View key={index} className="flex-row items-center justify-between bg-gray-50 rounded-lg p-3">
                                                    <View className="flex-row items-center flex-1">
                                                        <FileText size={20} color={colors.text} />
                                                        <Text className="ml-2 text-sm text-gray-600 flex-1" numberOfLines={1}>
                                                            {file.split('/').pop()}
                                                        </Text>
                                                    </View>
                                                    {isEditing && (
                                                        <TouchableOpacity
                                                            onPress={() => deleteFile(index)}
                                                            className="ml-2"
                                                        >
                                                            <X size={20} color="red" />
                                                        </TouchableOpacity>
                                                    )}
                                                </View>
                                            ))}
                                        </View>
                                    ) : (
                                        <Text className="text-sm text-gray-600">Aucun document</Text>
                                    )}
                                    {isEditing && (
                                        <TouchableOpacity
                                            onPress={pickDocument}
                                            className="flex-row items-center justify-center py-4 border-2 border-dashed border-gray-300 rounded-lg mt-4"
                                        >
                                            <FileUp size={20} color={colors.text} className="opacity-50" />
                                            <Text className="ml-2 text-sm text-gray-600">
                                                Ajouter un document
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        </View>
                    )}
                    keyExtractor={() => 'form'}
                />
            </View>
        </TouchableWithoutFeedback>
    );
}

