import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { ArrowRight } from "lucide-react-native";
import { useTheme } from "@react-navigation/native";
import Svg, { Circle } from "react-native-svg";

interface CircularButtonProps {
  onPress: () => void;
  disabled?: boolean;
  currentStep: number;
  totalSteps: number;
}

export function CircularButton({
  onPress,
  disabled = false,
  currentStep,
  totalSteps,
}: CircularButtonProps) {
  const { colors } = useTheme();

  const size = 80;
  const strokeWidth = 4;
  const center = size / 2;
  const radius = size / 2 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate progress (as a percentage)
  const progress = (currentStep / totalSteps) * 100;

  // Calculate the stroke dasharray and stroke dashoffset
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={styles.container}>
      <Svg height={size} width={size} style={styles.svg}>
        <Circle
          stroke={"#fff"}
          fill="none"
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <Circle
          stroke={colors.primary}
          fill="none"
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={[
          styles.button,
          {
            backgroundColor: disabled ? colors.border : colors.primary,
          },
        ]}
      >
        <ArrowRight size={30} color={colors.background} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 64,
    height: 64,
    justifyContent: "center",
    alignItems: "center",
  },
  svg: {
    position: "absolute",
  },
  button: {
    width: 66, // Increased from 52
    height: 66, // Increased from 52
    borderRadius: 33, // Increased to half of width/height
    alignItems: "center",
    justifyContent: "center",
  },
});
