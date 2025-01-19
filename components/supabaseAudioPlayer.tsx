import { Colors } from "@/constants/Colors";
import { supabase } from "@/utils/supabase";
import { useTheme } from "@react-navigation/native";
import { Audio } from "expo-av";
import { MoreVertical, Pause, Play } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { ActivityIndicator } from "react-native";
import * as Notifications from "expo-notifications";
import { scheduleNotification } from "@/utils/notifcations";

export default function FirebaseAudioPlayer({
  audioNote,
  bucket,
}: {
  audioNote: string;
  bucket: string;
}) {
  const [sound, setSound] = useState<Audio.Sound>();
  const [isPlaying, setIsPlaying] = useState(false);
  const { colors } = useTheme();
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  let fileName = audioNote.split("/")[1];

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor((milliseconds / 1000) % 60);
    const minutes = Math.floor((milliseconds / 1000 / 60) % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  async function initializeAudio() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error("Error initializing audio:", error);
    }
  }

  async function loadAudio() {
    try {
      setIsLoading(true);
      const { data, error: urlError } = await supabase.storage
        .from(bucket)
        .createSignedUrl(audioNote, 3600);

      if (urlError) {
        console.error("Error getting signed URL:", urlError);
        return;
      }

      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: data.signedUrl },
        { shouldPlay: false }
      );

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status && "isPlaying" in status) {
          setIsPlaying(status.isPlaying);
          if ("positionMillis" in status) {
            setPosition(status.positionMillis);
          }
          if ("durationMillis" in status && status.durationMillis) {
            setDuration(status.durationMillis);
          }
          if ("didJustFinish" in status && status.didJustFinish) {
            setIsPlaying(false);
          }
        }
      });

      setSound(newSound);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading audio:", error);
      setIsLoading(false);
    }
  }

  async function handlePlayPause() {
    if (!sound) return;

    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        // If we're at the end, start from beginning
        if (position >= duration) {
          await sound.setPositionAsync(0);
        }
        await sound.playAsync();
      }
    } catch (error) {
      console.error("Error playing/pausing audio:", error);
    }
  }

  useEffect(() => {
    initializeAudio();
    loadAudio();

    // Cleanup function
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  return (
    <View className="flex-1 p-3 bg-white rounded-lg shadow-sm">
      <TouchableOpacity
        className="flex-row items-center"
        onPress={handlePlayPause}
      >
        <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-4">
          {isLoading ? (
            <ActivityIndicator color={colors.primary} size="small" />
          ) : isPlaying ? (
            <Pause size={20} color={colors.primary} />
          ) : (
            <Play size={20} color={colors.primary} />
          )}
        </View>

        <View className="flex-1 ">
          <View className="w-[90%] h-1 bg-gray-200 rounded-full overflow-hidden">
            <View
              className="h-full bg-primary-500 rounded-full "
              style={{
                width: `${(position / duration) * 100}%`,
              }}
            />
          </View>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-xs text-gray-500">
            {formatTime(position)} / {formatTime(duration)}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
