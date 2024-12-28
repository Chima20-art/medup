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
} from "lucide-react-native";
import SupabaseFile from "@/components/supabaseFile";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { supabase } from "@/utils/supabase";
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { WebView } from 'react-native-webview';

const { height, width } = Dimensions.get("window");

interface ExamenDetailPopupProps {
  examen: any;
  slideAnim?: Animated.Value;
  bucket: string;
  onClose: () => void;
}

const ExamenDetailPopup: React.FC<ExamenDetailPopupProps> = ({
                                                               examen,
                                                               slideAnim: propSlideAnim,
                                                               bucket,
                                                               onClose,
                                                             }) => {
  if (!examen) {
    console.error("L'examen est nul ou non défini");
    return null;
  }

  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isPDFViewerOpen, setIsPDFViewerOpen] = useState(false);
  const defaultSlideAnim = useRef(new Animated.Value(height)).current;
  const slideAnim = propSlideAnim || defaultSlideAnim;

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
            Math.min(prev + 1, (examen.uploads?.length || 1) - 1)
        );
      } else if (translationX > 10) {
        setCurrentFileIndex((prev) => Math.max(prev - 1, 0));
      }
    }
  };

  const onDeleteItem = async () => {
    Alert.alert(
        "Confirmer la suppression",
        "Êtes-vous sûr de vouloir supprimer cet examen ?",
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Supprimer",
            style: "destructive",
            onPress: async () => {
              setLoading(true);
              try {
                let uploads: string[] = examen.uploads || [];
                let rowId: number = examen.id;

                const { error: deleteError } = await supabase
                    .from("radiologie")
                    .delete()
                    .eq("id", rowId);

                if (deleteError) throw deleteError;

                for (const upload of uploads) {
                  const { error: removeError } = await supabase.storage
                      .from("radiologie")
                      .remove([upload]);

                  if (removeError) throw removeError;
                }

                Alert.alert("Succès", "Examen supprimé avec succès");
                onClose();
              } catch (err) {
                console.error("Erreur lors de la suppression de l'élément:", err);
                Alert.alert("Erreur", "Échec de la suppression de l'examen");
              } finally {
                setLoading(false);
              }
            }
          }
        ]
    );
  };

  const downloadFile = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!examen.uploads || examen.uploads.length === 0) {
        throw new Error("Aucun fichier disponible pour le téléchargement");
      }

      let path = examen.uploads[currentFileIndex];
      const { data, error } = await supabase.storage
          .from("radiologie")
          .createSignedUrl(path, 3600);

      if (error) throw error;

      let signedUrl = data?.signedUrl;
      if (!signedUrl) throw new Error("URL signée invalide");

      const fileName = path.split("/").pop() || "fichier-téléchargé";
      const downloadResult = await FileSystem.downloadAsync(
          signedUrl,
          FileSystem.documentDirectory + fileName
      );

      if (downloadResult.status !== 200) throw new Error("Le téléchargement a échoué");

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(downloadResult.uri);
      } else {
        throw new Error("Le partage n'est pas disponible sur cette plateforme");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur s'est produite");
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

      if (!examen.uploads || examen.uploads.length === 0) {
        throw new Error("Aucun fichier disponible pour la visualisation");
      }

      let path = examen.uploads[currentFileIndex];
      const { data, error } = await supabase.storage
          .from("radiologie")
          .createSignedUrl(path, 3600);

      if (error) throw error;

      setPdfUrl(data.signedUrl);
      setIsPDFViewerOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur s'est produite");
      console.error("Erreur lors de la visualisation du fichier:", err);
      Alert.alert("Erreur", "Échec de l'ouverture du fichier");
    } finally {
      setLoading(false);
    }
  };

  const isCurrentFilePDF = useMemo(() => {
    if (!examen.uploads || examen.uploads.length === 0) return false;
    const currentFile = examen.uploads[currentFileIndex];
    return currentFile.toLowerCase().endsWith('.pdf');
  }, [examen.uploads, currentFileIndex]);

  const MemoizedFileView = useMemo(() => {
    if (!examen.uploads || examen.uploads.length === 0) {
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
                  path={examen.uploads[currentFileIndex]}
                  bucket={bucket}
              />
            </View>
          </PanGestureHandler>
          {examen.uploads.length > 1 && (
              <View className="flex-row justify-center space-x-1">
                {examen.uploads.map((_: any, index: number) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => setCurrentFileIndex(index)}
                        className={`w-2 h-2 rounded-full ${
                            currentFileIndex === index ? "bg-indigo-600" : "bg-gray-300"
                        }`}
                    />
                ))}
              </View>
          )}
        </View>
    );
  }, [currentFileIndex, examen.uploads, bucket, loading]);

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
          <View className="p-4 border-b border-gray-100">
            <View className="flex-row justify-between items-center">
              <Text className="text-2xl font-bold text-indigo-600">
                {examen.name}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <ChevronDown size={24} color="#4F46E5" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="px-8 py-1 flex-row justify-around bg-gray-100 mx-auto w-[70%] rounded-full mb-2 ">
            <TouchableOpacity onPress={onDeleteItem} className="p-2">
              <Trash2 size={20} color="#666666" />
            </TouchableOpacity>
            <TouchableOpacity
                onPress={isCurrentFilePDF ? handleViewFile : undefined}
                className={`p-2 ${isCurrentFilePDF ? '' : 'opacity-50'}`}
            >
              <Eye size={20} color="#666666" />
            </TouchableOpacity>
            <TouchableOpacity onPress={downloadFile} className="p-2">
              <Download size={20} color="#666666" />
            </TouchableOpacity>
            <TouchableOpacity className="p-2">
              <Share2 size={20} color="#666666" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-4">
            <View className="border border-gray-200 rounded-xl p-2 mx-auto w-[80%]">
              {examen.uploads && examen.uploads.length > 0 && MemoizedFileView}

              <View className="flex flex-col gap-y-3">
                <Text className="text-gray-700">
                  {examen.date ? new Date(examen.date).toLocaleDateString() : 'Date non disponible'}
                </Text>
                <Text className="font-bold text-gray-700">{examen.labName || 'Laboratoire non spécifié'}</Text>
                <Text className="text-gray-700">{examen.phone || 'Téléphone non disponible'}</Text>
              </View>
            </View>

            <View className="mx-4">
              {examen.notes && (
                  <View className="mt-6">
                    <Text className="text-lg font-semibold mb-2">Notes :</Text>
                    <View className="bg-gray-50 rounded-xl p-4">
                      <Text className="text-gray-700">{examen.notes}</Text>
                    </View>
                  </View>
              )}

              {examen.uploads && examen.uploads.length > 0 && (
                  <View className="mt-6">
                    <Text className="text-lg font-semibold mb-2">
                      Fichiers ({examen.uploads.length}) :
                    </Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="flex-row space-x-3"
                    >
                      {examen.uploads.map((upload: string, index: number) => (
                          <TouchableOpacity
                              key={index}
                              onPress={() => setCurrentFileIndex(index)}
                              className={`w-24 h-24 rounded-xl overflow-hidden ${
                                  currentFileIndex === index
                                      ? "border-2 border-indigo-600"
                                      : "border border-gray-200"
                              }`}
                          >
                            <SupabaseFile path={upload} bucket={bucket} />
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
                    source={{ uri: `https://docs.google.com/gview?embedded=true&url=${pdfUrl}` }}
                    onLoadEnd={() => setLoading(false)}
                    style={{ flex: 1 }}
                />
              </View>
            </SafeAreaView>
          </View>
        </Modal>
      </>
  );
};

export default ExamenDetailPopup;

