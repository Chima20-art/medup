import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { ChevronLeft, Upload, Calendar, User2, Building2, FileText, Image as ImageIcon, Mic, Play, Pause, MoreVertical, Trash, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';

interface AudioNote {
    id: string;
    uri: string;
    duration: number;
    currentTime: number;
    sound?: Audio.Sound;
}

interface UploadedFile {
    uri: string;
    type: 'image' | 'document';
    name: string;
}

export default function AddExaminRadiologiques() {
    const router = useRouter();
    const { colors } = useTheme();
    const [formData, setFormData] = useState({
        name: '',
        date: '',
        prescripteur: '',
        laboratory: '',
        notes: '',
        files: [] as UploadedFile[],
    });
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [audioNotes, setAudioNotes] = useState<AudioNote[]>([]);
    const [selectedAudioId, setSelectedAudioId] = useState<string | null>(null);
    const [showOptionsFor, setShowOptionsFor] = useState<string | null>(null);

    useEffect(() => {
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

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            const newFile: UploadedFile = {
                uri: result.assets[0].uri,
                type: 'image',
                name: result.assets[0].uri.split('/').pop() || 'image',
            };
            setFormData(prev => ({
                ...prev,
                files: [...prev.files, newFile]
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
                    type: 'image',
                    name: result.assets[0].uri.split('/').pop() || 'image',
                };
                setFormData(prev => ({
                    ...prev,
                    files: [...prev.files, newFile]
                }));
            }
        }
    };

    const pickDocument = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: 'application/pdf',
        });

        if (result.assets && result.assets[0]) {
            const newFile: UploadedFile = {
                uri: result.assets[0].uri,
                type: 'document',
                name: result.assets[0].name,
            };
            setFormData(prev => ({
                ...prev,
                files: [...prev.files, newFile]
            }));
        }
    };

    const deleteFile = (index: number) => {
        setFormData(prev => ({
            ...prev,
            files: prev.files.filter((_, i) => i !== index)
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
            console.error('Failed to start recording', err);
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
            // Pause current audio
            await audioNote.sound.pauseAsync();
            setSelectedAudioId(null);
        } else {
            // Stop any playing audio
            if (selectedAudioId) {
                const playingNote = audioNotes.find(note => note.id === selectedAudioId);
                if (playingNote?.sound) {
                    await playingNote.sound.stopAsync();
                }
            }
            // Play selected audio
            await audioNote.sound.playAsync();
            setSelectedAudioId(audioId);

            // Update progress
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

    const handleSubmit = () => {
        console.log('Form submitted:', formData);
        // Handle form submission here
        router.back();
    };

    return (
        <View className="flex-1 bg-gray-50">
            <View className="px-6 pt-14 pb-6 bg-white">
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
                    >
                        <ChevronLeft size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text className="text-xl font-semibold text-gray-900">Ajouter un examen radiologique</Text>
                    <TouchableOpacity
                        onPress={handleSubmit}
                        className="px-4 py-2 bg-indigo-600 rounded-full"
                    >
                        <Text className="text-white font-semibold">Enregistrer</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1 p-6">
                <View className="space-y-4">
                    {/* Name/Type Input */}
                    <View>
                        <Text className="text-sm font-medium text-gray-700 mb-1">Nom / Type</Text>
                        <View className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 h-12">
                            <User2 size={20} color={colors.text} className="opacity-50" />
                            <TextInput
                                value={formData.name}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
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
                                onChangeText={(text) => setFormData(prev => ({ ...prev, date: text }))}
                                placeholder="Date"
                                className="flex-1 ml-3"
                            />
                        </View>
                    </View>

                    {/* Prescripteur Input */}
                    <View>
                        <Text className="text-sm font-medium text-gray-700 mb-1">Medecin prescripteur</Text>
                        <View className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 h-12">
                            <User2 size={20} color={colors.text} className="opacity-50" />
                            <TextInput
                                value={formData.prescripteur}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, prescripteur: text }))}
                                placeholder="Medecin prescripteur"
                                className="flex-1 ml-3"
                            />
                        </View>
                    </View>

                    {/* Laboratory Input */}
                    <View>
                        <Text className="text-sm font-medium text-gray-700 mb-1">Nom du Labo</Text>
                        <View className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 h-12">
                            <Building2 size={20} color={colors.text} className="opacity-50" />
                            <TextInput
                                value={formData.laboratory}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, laboratory: text }))}
                                placeholder="Nom du Labo"
                                className="flex-1 ml-3"
                            />
                        </View>
                    </View>

                    {/* File Upload Section */}
                    <View>
                        <Text className="text-sm font-medium text-gray-700 mb-1">Ajouter l'analyse</Text>
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
                                            {file.type === 'image' ? (
                                                <Image
                                                    source={{ uri: file.uri }}
                                                    className="w-20 h-20 rounded-lg"
                                                />
                                            ) : (
                                                <View className="w-20 h-20 bg-gray-200 rounded-lg items-center justify-center">
                                                    <FileText size={24} color={colors.primary} />
                                                    <Text className="text-xs text-gray-600 mt-1" numberOfLines={1}>
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
                        <Text className="text-sm font-medium text-gray-700 mb-1">Notes</Text>
                        <View className="bg-white rounded-xl border border-gray-200 p-4">
                            <TextInput
                                value={formData.notes}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
                                placeholder="Ajouter des notes..."
                                multiline
                                numberOfLines={4}
                                className="min-h-[100] mb-4"
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
                                <Text className="text-sm text-gray-600">
                                    {isRecording ? 'Arrêter l\'enregistrement' : 'Enregistrer une note audio'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}