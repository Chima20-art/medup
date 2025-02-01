import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, Modal, SafeAreaView } from "react-native";
import { supabase } from "@/utils/supabase";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import {FileText, Eye, X, FolderDown, Share2} from 'lucide-react-native';
import Pdf from "@/assets/images/pdf.svg";
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { WebView } from "react-native-webview";
import ImageView from "react-native-image-viewing";

export default function SupabaseFile({
                                       path,
                                       bucket = "radiologie",
                                       compact = false,
                                     }: {
  path: string;
  bucket: string;
  compact?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPDFViewerOpen, setIsPDFViewerOpen] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);

  const isFileAnImage = /\.(jpg|jpeg|png|gif)$/i.test(path);
  const isPDF = /\.pdf$/i.test(path);
  const fileName = path.split("/").pop() || "file";

  useEffect(() => {
    getSignedUrl();
  }, []);

  const getSignedUrl = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.storage
          .from(bucket)
          .createSignedUrl(path, 3600);

      if (error) throw error;

      if (data?.signedUrl) {
        setSignedUrl(data.signedUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error getting signed URL:", err);
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!signedUrl) {
        throw new Error("No signed URL available");
      }

      const downloadResult = await FileSystem.downloadAsync(
          signedUrl,
          FileSystem.documentDirectory + fileName
      );

      if (downloadResult.status !== 200) {
        throw new Error("Download failed");
      }

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(downloadResult.uri);
      } else {
        throw new Error("Sharing is not available on this platform");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error downloading file:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewFile = () => {
    if (signedUrl) {
      if (isPDF) {
        setIsPDFViewerOpen(true);
      } else if (isFileAnImage) {
        setImageViewerVisible(true);
      }
    }
  };

  if (compact) {
    return (
        <TouchableOpacity
            className="flex-row items-center p-2 bg-gray-100 rounded-md mb-2"
            onPress={handleViewFile}
        >
          {isPDF ? (
              <Pdf width={24} height={24} />
          ) : isFileAnImage ? (
              <Image
                  source={{ uri: signedUrl || undefined }}
                  className="w-6 h-6 rounded"
              />
          ) : (
              <FileText size={24} color="#000" />
          )}
          <Text className="ml-2 flex-1">{fileName}</Text>
          <TouchableOpacity onPress={downloadFile}>
            <Share2 size={24} color="#000" />
          </TouchableOpacity>

          <Modal
              animationType="slide"
              transparent={true}
              visible={isPDFViewerOpen}
              onRequestClose={() => setIsPDFViewerOpen(false)}
          >
            {signedUrl && isPDF && (
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
                            uri: `https://docs.google.com/gview?embedded=true&url=${signedUrl}`,
                          }}
                          onLoadEnd={() => setLoading(false)}
                          style={{ flex: 1 }}
                      />
                    </View>
                  </SafeAreaView>
                </View>
            )}
          </Modal>

          {signedUrl && isFileAnImage && (
              <ImageView
                  images={[{ uri: signedUrl }]}
                  imageIndex={0}
                  visible={imageViewerVisible}
                  onRequestClose={() => setImageViewerVisible(false)}
              />
          )}
        </TouchableOpacity>
    );
  }

  return (
      <View className="w-full h-64 justify-center items-center">
        {loading && <LoadingSpinner />}

        {error && <Text className="text-red-500 px-4">Error: {error}</Text>}

        {!loading && isFileAnImage && signedUrl && (
            <Image
                source={{ uri: signedUrl }}
                className="w-full h-64"
                resizeMode="contain"
            />
        )}

        {!loading && (isPDF || (!isFileAnImage && !isPDF)) && (
            <View className="items-center">
              <Pdf width={200} height={250} />
            </View>
        )}
      </View>
  );
}
