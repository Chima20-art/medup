import React, { useState } from "react";
import { Switch, Text, View } from "react-native";
import PillIcon from "@/assets/images/pillIcon.svg";
import { differenceInDays } from "date-fns";
import { scheduleNotification } from "@/utils/notifcations";
import {useTheme} from "@react-navigation/native";

interface UploadedFile {
  uri: string;
  name: string;
}

interface MedicationCardProps {
medication: {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  dosage: string;
  stock: string;
  duration: string;
  frequency: string;
  notes: string;
  schedule: {
    matin: boolean;
    apres_midi: boolean;
    soir: boolean;
    nuit: boolean;
  };
  isActive: boolean;
  reminders: string[];
  file: UploadedFile | null;
  image: UploadedFile | null
}
}


export default function MedicationCard({ medication }: MedicationCardProps) {
  const [isEnabled, setIsEnabled] = useState(medication.isActive);

  const toggleSwitch = () => {
    setIsEnabled((previousState) => !previousState);
  };


  const { colors } = useTheme();
  // Calculate remaining pills as a number from stock string
  const remainingPills = parseInt(medication.stock) || 0;

  // Format the schedule information
  const formatSchedule = (schedule: any) => {
    // Map of schedule labels
    const scheduleLabels = {
      matin: "matin",
      apres_midi: "après-midi",
      soir: "soir",
      nuit: "nuit",
    };

    // Filter true values and get their labels
    const activeTimes = Object.keys(schedule)
      .filter((key) => schedule[key as keyof typeof schedule])
      .map((key) => scheduleLabels[key as keyof typeof scheduleLabels]);

    // Count the true values
    const frequency = activeTimes.length;

    // Join the labels into a string (e.g., "matin et soir")
    const activeTimesText =
      activeTimes.length > 1
        ? `${activeTimes.slice(0, -1).join(", ")} et ${activeTimes.slice(-1)}`
        : activeTimes[0] || "";

    // Format the result
    return `${frequency} fois/jour${
      activeTimesText ? `: ${activeTimesText}` : ""
    }`;
  };
  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const days = differenceInDays(end, start) + 1; // Include start date

    return `pendant ${days} jour${days > 1 ? "s" : ""}`;
  };
  return (
    <View className="bg-primary-50 rounded-3xl p-6 mt-4 mb-6 relative">
      <View className="flex-row items-center mb-4">
        <Text
          style={{ fontFamily: "Poppins_800ExtraBold" }}
          className="text-3xl font-black text-starts"
        >
          {medication.name}
        </Text>
        <Switch
          trackColor={{ false: "primary", true: colors.primary }}
          thumbColor={"#fff"}
          onValueChange={toggleSwitch}
          value={isEnabled}
          className="ml-4"
        />
      </View>

      <View className="mb-2 space-y-1">
        <Text
            style={{ fontFamily: "Poppins_400Regular" }}
            className="text-gray-600 font-bold"
        >
          • début: {new Date(medication.startDate).toLocaleDateString()}, fin:{" "}
          {new Date(medication.endDate).toLocaleDateString()}
        </Text>

        <Text
          style={{ fontFamily: "Poppins_400Regular" }}
          className="text-gray-600 font-bold"
        >
          • {medication.dosage} mg
        </Text>

        <Text
          style={{ fontFamily: "Poppins_400Regular" }}
          className="text-gray-600 font-bold"
        >
          • Il reste {medication.stock} comprimés
        </Text>

      </View>

        {/* Duration pill - Calculate duration from start and end date */}
        <View className="relative bg-secondary rounded-xl py-2 pt-4 px-4">

          <Text  className="text-secondary font-semibold w-fit bg-primary-500 text-sm absolute right-0 -top-2 p-2 rounded-lg">
            Pendant{ medication.duration}  jours
          </Text>
          <Text
            style={{ fontFamily: "Poppins_500Medium" }}
            className="text-black font-semibold text-md"
          >
            { medication.frequency} foix/jour, le matin, le soir
          </Text>
        </View>

      {/* Position pill icon in top right, rotated horizontally */}
      <View className="absolute -top-8 right-4 transform -scale-x-[-1]">
        <PillIcon size={10} />
      </View>
    </View>
  );
}
