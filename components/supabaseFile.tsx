import { supabase } from "@/utils/supabase";
import { useEffect, useState } from "react";
import { Button, Image, Text, View } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

export default function SupabaseFile({ path }: { path: string }) {
  const [loading, setLoading] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isFileAnImage =
    path.includes(".png") || path.includes(".jpg") || path.includes(".jpeg");

  useEffect(() => {
    getSignedUrl();
  }, [path]);

  const getSignedUrl = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.storage
        .from("radiologie") // Replace with your bucket name
        .createSignedUrl(path, 3600); // URL valid for 1 hour

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error downloading file:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="w-full h-64 ">
      {loading && <Text>Loading...</Text>}

      {error && <Text className="text-red-500 px-4">Error: {error}</Text>}

      {!loading && isFileAnImage && signedUrl && (
        <Image
          source={{ uri: signedUrl }}
          className="w-full h-64"
          resizeMode="contain"
        />
      )}

      {!loading && !isFileAnImage && (
        <Button title="Download File" onPress={downloadFile} />
      )}
    </View>
  );
}
