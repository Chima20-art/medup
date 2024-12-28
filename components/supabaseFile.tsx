import React, { useEffect, useState } from "react";
import {View, Text, Image, Button, TouchableOpacity} from "react-native";
import { supabase } from "@/utils/supabase";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { FileText } from 'lucide-react-native';
import Pdf from "@/assets/images/pdf.svg"

// Assuming you have a LoadingSpinner component
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function SupabaseFile({
                                       path,
                                       bucket = "radiologie",
                                     }: {
  path: string;
  bucket: string;
}) {
  const [loading, setLoading] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isFileAnImage = /\.(jpg|jpeg|png|gif)$/i.test(path);
  const isPDF = /\.pdf$/i.test(path);

  useEffect(() => {
    getSignedUrl();
  }, [path]);

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

      const fileName = path.split("/").pop() || "downloaded-file";

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
              <TouchableOpacity  onPress={downloadFile} className="mt-2">
                Download File
              </TouchableOpacity>
            </View>
        )}
      </View>
  );
}

