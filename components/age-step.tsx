"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, Platform, Image } from "react-native"
import { useTheme } from "@react-navigation/native"
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker"
import { CircularButton } from "@/components/Cicular-button"
import React from "react"

export default function DateOfBirthStep({
                                          onContinue,
                                          currentStep,
                                          totalSteps,
                                        }: {
  onContinue: (date: Date) => void
  currentStep: number
  totalSteps: number
}) {
  const { colors } = useTheme()
  const [date, setDate] = useState(new Date())
  const [showPicker, setShowPicker] = useState(false)

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowPicker(false)
    }

    if (selectedDate) {
      setDate(selectedDate)
    }
  }

  const showDatepicker = () => {
    setShowPicker(true)
  }

  const formattedDate = new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "long", // Nom complet du mois (ex: "décembre")
    day: "numeric", // Jour du mois
  }).format(date)

  return (
      <View className="flex-1 pt-16">
        <View className="mx-auto">
          <Image source={require("../assets/images/Logo.png")} />
        </View>
        <View className="h-16 flex-row items-center justify-center px-5">
          <View className="flex flex-row gap-x-0.5">
            {[1, 2, 3, 4, 5, 6].map((step) => (
                <View
                    key={step}
                    className={`h-1 w-10 rounded-full`}
                    style={{
                      backgroundColor: step <= 5 ? colors.primary : colors.border,
                    }}
                />
            ))}
          </View>
        </View>

        <View className="flex-1 px-2">
          <Text className="text-2xl font-bold text-center mt-6" style={{ color: colors.text }}>
            Quelle est votre date de naissance ?
          </Text>

          <TouchableOpacity onPress={showDatepicker} className="mt-4">
            <Text className="text-xl font-semibold mb-4 text-center" style={{ color: colors.primary }}>
              {formattedDate}
            </Text>
          </TouchableOpacity>

          <View className="flex-1 items-center justify-center">
            {showPicker && (
                <DateTimePicker
                    value={date}
                    onChange={handleDateChange}
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    mode="date"
                    locale="fr-FR"
                    // Pour iOS, nous ajoutons ces boutons
                    {...(Platform.OS === "ios" && {
                      onConfirm: (selectedDate: Date) => {
                        setShowPicker(false)
                        setDate(selectedDate)
                      },
                      onCancel: () => {
                        setShowPicker(false)
                      },
                    })}
                />
            )}
          </View>

          {Platform.OS === "ios" && showPicker && (
              <View className="flex-row justify-between px-4 mb-4">
                <TouchableOpacity
                    onPress={() => setShowPicker(false)}
                    className="py-2 px-4 rounded"
                    style={{ backgroundColor: colors.border }}
                >
                  <Text>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setShowPicker(false)}
                    className="py-2 px-4 rounded"
                    style={{ backgroundColor: colors.primary }}
                >
                  <Text style={{ color: "white" }}>OK</Text>
                </TouchableOpacity>
              </View>
          )}

          <View className="items-center mb-4">
            <CircularButton onPress={() => onContinue(date)} currentStep={currentStep} totalSteps={totalSteps} />
          </View>
        </View>
      </View>
  )
}
