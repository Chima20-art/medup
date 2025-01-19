import React, { useState, useRef, useMemo } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Animated,
    Dimensions,
    Modal,
    SafeAreaView,
    Alert,
} from "react-native";
import {
    Trash2,
    Eye,
    Download,
    Share2,
    ChevronDown,
    X,
    User2,
    Building2,
    Calendar,
    Bell,
} from "lucide-react-native";
import ImageView from "react-native-image-viewing";
import SupabaseFile from "@/components/supabaseFile";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { supabase } from "@/utils/supabase";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { WebView } from "react-native-webview";
import Notes from "@/assets/images/notes-icon.svg";
import SupabaseAudioPlayer from "./supabaseAudioPlayer";
import EmptyImage from "@/assets/images/EmptyImage.svg";

const { height } = Dimensions.get("window");
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
interface ConsultationDetailPopupProps {
    consultation: Consultation;
    slideAnim?: Animated.Value;
    onClose: () => void;
}

const ConsultationDetailPopup: React.FC<ConsultationDetailPopupProps> = ({
                                                                             consultation,
                                                                             slideAnim: propSlideAnim,
                                                                             onClose,
                                                                         }) => {
    if (!consultation) {
        console.error("La consultation est nulle ou non définie");
        return null;
    }

    const [currentFileIndex, setCurrentFileIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [isPDFViewerOpen, setIsPDFViewerOpen] = useState(false);
    const [imageViewerVisible, setImageViewerVisible] = useState(false);
    const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
    const defaultSlideAnim = useRef(new Animated.Value(height)).current;
    const slideAnim = propSlideAnim || defaultSlideAnim;

    let audioNotes: string[] = Array.isArray(consultation.audio_notes)
        ? consultation.audio_notes
        : [];

    const translateY = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [height, 0],
    });

    React.useEffect(() => {
        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
        }).start();
    }, [slideAnim]);

    const handleGesture = (event: any) => {
        if (event.nativeEvent.state === State.END) {
            const { translationX } = event.nativeEvent;
            if (translationX < -10) {
                setCurrentFileIndex((prev) =>
                    Math.min(prev + 1, (consultation.uploads?.length || 1) - 1)
                );
            } else if (translationX > 10) {
                setCurrentFileIndex((prev) => Math.max(prev - 1, 0));
            }
        }
    };

    const onDeleteItem = async () => {
        Alert.alert(
            "Confirmer la suppression",
            "Êtes-vous sûr de vouloir supprimer cette consultation ?",
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Supprimer",
                    style: "destructive",
                    onPress: async () => {
                        setLoading(true);
                        try {
                            let uploads: string[] = consultation.uploads || [];
                            let rowId: number = consultation.id;

                            const { error: deleteError } = await supabase
                                .from("consultations")
                                .delete()
                                .eq("id", rowId);

                            if (deleteError) throw deleteError;

                            for (const upload of uploads) {
                                const { error: removeError } = await supabase.storage
                                    .from("consultations")
                                    .remove([upload]);

                                if (removeError) throw removeError;
                            }

                            Alert.alert("Succès", "Consultation supprimée avec succès");
                            onClose();
                        } catch (err) {
                            console.error("Erreur lors de la suppression:", err);
                            Alert.alert("Erreur", "Échec de la suppression de la consultation");
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const downloadFile = async () => {
        try {
            setLoading(true);
            setError(null);

            if (!consultation.uploads || consultation.uploads.length === 0) {
                throw new Error("Aucun fichier disponible pour le téléchargement");
            }

            let path = consultation.uploads[currentFileIndex];
            const { data, error } = await supabase.storage
                .from("consultations")
                .createSignedUrl(path, 3600);

            if (error) throw error;

            let signedUrl = data?.signedUrl;
            if (!signedUrl) throw new Error("URL signée invalide");

            const fileName = path.split("/").pop() || "fichier-téléchargé";
            const downloadResult = await FileSystem.downloadAsync(
                signedUrl,
                FileSystem.documentDirectory + fileName
            );

            if (downloadResult.status !== 200)
                throw new Error("Le téléchargement a échoué");

            const canShare = await Sharing.isAvailableAsync();
            if (canShare) {
                await Sharing.shareAsync(downloadResult.uri);
            } else {
                throw new Error("Le partage n'est pas disponible sur cette plateforme");
            }
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Une erreur s'est produite"
            );
            console.error("Erreur lors du téléchargement du fichier:", err);
            Alert.alert("Erreur", "Échec du téléchargement du fichier");
        } finally {
            setLoading(false);
        }
    };

    const handleViewFile = async () => {
        try {
            setLoading(true);
            setError(null);

            if (!consultation.uploads || consultation.uploads.length === 0) {
                throw new Error("Aucun fichier disponible pour la visualisation");
            }

            let path = consultation.uploads[currentFileIndex];
            const { data, error } = await supabase.storage
                .from("consultations")
                .createSignedUrl(path, 3600);

            if (error) throw error;

            const fileUrl = data.signedUrl;
            if (isCurrentFilePDF) {
                setPdfUrl(fileUrl);
                setIsPDFViewerOpen(true);
            } else {
                setCurrentImageUrl(fileUrl);
                setImageViewerVisible(true);
            }
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Une erreur s'est produite"
            );
            console.error("Erreur lors de la visualisation du fichier:", err);
            Alert.alert("Erreur", "Échec de l'ouverture du fichier");
        } finally {
            setLoading(false);
        }
    };

    const isCurrentFilePDF = useMemo(() => {
        if (!consultation.uploads || consultation.uploads.length === 0) return false;
        const currentFile = consultation.uploads[currentFileIndex];
        return currentFile.toLowerCase().endsWith(".pdf");
    }, [consultation.uploads, currentFileIndex]);

    const isCurrentFileViewable = useMemo(() => {
        if (!consultation.uploads || consultation.uploads.length === 0) return false;
        const currentFile = consultation.uploads[currentFileIndex].toLowerCase();
        return (
            currentFile.endsWith(".pdf") ||
            currentFile.endsWith(".jpg") ||
            currentFile.endsWith(".png") ||
            currentFile.endsWith(".jpeg")
        );
    }, [consultation.uploads, currentFileIndex]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    const formatTONormalDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const MemoizedFileView = useMemo(() => {
        if (!consultation.uploads || consultation.uploads.length === 0) {
            return null;
        }

        if (loading) {
            return <LoadingSpinner />;
        }

        return (
            <View className="py-4">
                <PanGestureHandler onHandlerStateChange={handleGesture}>
                    <View className="bg-gray-50 mb-2">
                        <SupabaseFile
                            path={consultation.uploads[currentFileIndex]}
                            bucket="consultations"
                        />
                    </View>
                </PanGestureHandler>
                {consultation.uploads.length > 1 && (
                    <View className="flex-row justify-center gap-x-1">
                        {consultation.uploads.map((_: any, index: number) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => setCurrentFileIndex(index)}
                                className={`w-2 h-2 rounded-full ${
                                    currentFileIndex === index ? "bg-primary-500" : "bg-gray-300"
                                }`}
                            />
                        ))}
                    </View>
                )}
            </View>
        );
    }, [currentFileIndex, consultation.uploads, loading]);

    return (
        <>
            <Animated.View
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: height * 0.7,
                    backgroundColor: "white",
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    transform: [{ translateY }],
                    shadowColor: "#000",
                    shadowOffset: {
                        width: 0,
                        height: -2,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                }}
            >
                <View className="p-2 mb-2">
                    <View className="flex-row justify-between items-center">
                        <View>
                            <Text className="text-2xl ml-2 font-bold text-primary-500">
                                Consultation
                            </Text>
                            <View
                                style={{ backgroundColor: consultation.specialties.hexColor }}
                                className="px-3 py-1 rounded-full ml-2 mt-1 self-start"
                            >
                                <Text className="text-white font-medium">
                                    {consultation.specialties.name}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={onClose}
                            className="bg-gray-50 p-2 rounded-full"
                        >
                            <ChevronDown size={28} color="#4F46E5" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="px-8 py-1 flex-row justify-around bg-[#E1E1E1] mx-auto w-[70%] rounded-full mb-2">
                    <TouchableOpacity onPress={onDeleteItem} className="p-2">
                        <Trash2 size={20} color="#5b7bf6" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={isCurrentFileViewable ? handleViewFile : undefined}
                        className={`p-2 ${isCurrentFileViewable ? "" : "opacity-50"}`}
                    >
                        <Eye size={20} color="#5b7bf6" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={downloadFile} className="p-2">
                        <Download size={20} color="#5b7bf6" />
                    </TouchableOpacity>
                    <TouchableOpacity className="p-2">
                        <Share2 size={20} color="#5b7bf6" />
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1 px-4 pb-6">
                    <View className="border border-gray-200 rounded-xl p-4 mx-auto w-[90%]">

                            {consultation.uploads && consultation.uploads.length > 0 ?
                                MemoizedFileView :  <View className={"mx-auto mb-2"}><EmptyImage width={200} height={200} /></View>}



                        <View className="flex flex-col gap-y-4">
                            <View className="flex-row items-center gap-x-2">
                                <Calendar size={20} color="#4B5563" className="mr-2" />
                                <Text className="text-gray-700">
                                    {formatTONormalDate(consultation.date)}
                                </Text>
                            </View>

                            <View className="flex-row items-center gap-x-2">
                                <User2 size={20} color="#4B5563" className="mr-2" />
                                <Text className="font-bold text-gray-700">
                                    {consultation.doctorName}
                                </Text>
                            </View>

                            <View className="flex-row items-center gap-x-2">
                                <Building2 size={20} color="#4B5563" className="mr-2" />
                                <Text className="text-gray-700">
                                    {consultation.adress}, {consultation.city}
                                </Text>
                            </View>

                            {consultation.nextConsultationDate && (
                                <View className="flex-row items-center gap-x-2">
                                    <Bell size={20} color="#4B5563" className="mr-2" />
                                    <Text className="text-gray-700">
                                        Prochain rendez-vous: {formatDate(consultation.nextConsultationDate)}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    <View className="mx-4">
                        {consultation.note && (
                            <View className="mt-6">
                                <View className="relative bg-[#EFEFEF] rounded-xl p-4 mb-2 mt-6">
                                    <View className="absolute -top-10 -left-14">
                                        <Notes />
                                    </View>
                                    <Text className="text-lg font-semibold ml-14 my-2">
                                        Notes :
                                    </Text>
                                    <Text className="text-gray-700">{consultation.note}</Text>
                                </View>
                            </View>
                        )}

                        {audioNotes.length > 0 && (
                            <View className="mb-4">
                                {audioNotes.map((audio: string) => (
                                    <View
                                        key={audio}
                                        className="flex-row items-center justify-between py-2 border-b border-gray-100"
                                    >
                                        <SupabaseAudioPlayer bucket="consultations" audioNote={audio} />
                                    </View>
                                ))}
                            </View>
                        )}

                        {consultation.uploads && consultation.uploads.length > 0 && (
                            <View className="mt-6">
                                <Text className="text-lg font-semibold mb-2">
                                    Fichiers ({consultation.uploads.length}) :
                                </Text>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    className="flex-row gap-x-3"
                                >
                                    {consultation.uploads.map((upload: string, index: number) => (
                                        <TouchableOpacity
                                            key={index}
                                            onPress={() => setCurrentFileIndex(index)}
                                            className={`w-24 h-24 rounded-xl overflow-hidden ${
                                                currentFileIndex === index
                                                    ? "border-2 border-primary-500"
                                                    : "border border-gray-200"
                                            }`}
                                        >
                                            <SupabaseFile path={upload} bucket="consultations" />
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </Animated.View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={isPDFViewerOpen}
                onRequestClose={() => setIsPDFViewerOpen(false)}
            >
                {pdfUrl && (
                    <View className="flex-1 bg-black bg-opacity-50">
                        <SafeAreaView className="flex-1 m-4 bg-white rounded-lg overflow-hidden">
                            <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
                                <Text className="text-lg font-semibold">Visualiseur PDF</Text>
                                <TouchableOpacity onPress={() => setIsPDFViewerOpen(false)}>
                                    <X size={24} color="#000" />
                                </TouchableOpacity>
                            </View>
                            <View className="flex-1">
                                {loading && <LoadingSpinner />}
                                <WebView
                                    source={{
                                        uri: `https://docs.google.com/gview?embedded=true&url=${pdfUrl}`,
                                    }}
                                    onLoadEnd={() => setLoading(false)}
                                    style={{ flex: 1 }}
                                />
                            </View>
                        </SafeAreaView>
                    </View>
                )}
            </Modal>

            {currentImageUrl && (
                <ImageView
                    images={[{ uri: currentImageUrl }]}
                    imageIndex={0}
                    visible={imageViewerVisible}
                    onRequestClose={() => setImageViewerVisible(false)}
                />
            )}
        </>
    );
};

export default ConsultationDetailPopup;

