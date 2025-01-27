import type React from "react"
import { useState, useCallback } from "react"
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput, Switch, Image } from "react-native"
import { useTheme } from "@react-navigation/native"
import { supabase } from "@/utils/supabase"
import { useRouter } from "expo-router"
import {
  Calendar,
  Clock,
  Edit2,
  FileText,
  FlaskConical,
  Pill,
  Repeat,
  Save,
  Trash2,
  X,
  Download,
  Container,
  Timer,
  ArrowLeft,
} from "lucide-react-native"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import * as FileSystem from "expo-file-system"
import * as Sharing from "expo-sharing"
import Medicine from "@/assets/images/medicine.svg"
import SupabaseAudioPlayer from "@/components/SupabaseAudioPlayer"
import DateTimePicker from "@react-native-community/datetimepicker"

interface MedicamentDetailProps {
  initialData: {
    id: string
    name: string
    startDate: string
    endDate: string
    dosage: string
    stock: string
    duration: string
    frequency: string
    notes: string
    schedule: {
      matin: boolean
      apres_midi: boolean
      soir: boolean
      nuit: boolean
    }
    isActive: boolean
    reminders: string[]
    uploads: { uri: string; name: string; type: string }[]
    momentDePrise: string
  }
}

const MedicamentDetail: React.FC<MedicamentDetailProps> = ({ initialData }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState(initialData)
  const [showStartDatePicker, setShowStartDatePicker] = useState(false)
  const [showEndDatePicker, setShowEndDatePicker] = useState(false)
  const { colors } = useTheme()
  const router = useRouter()

  const handleUpdate = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase
          .from("medicaments")
          .update({
            name: formData.name,
            startDate: formData.startDate,
            endDate: formData.endDate,
            dosage: formData.dosage,
            stock: formData.stock,
            duration: formData.duration,
            frequency: formData.frequency,
            notes: formData.notes,
            schedule: formData.schedule,
            isActive: formData.isActive,
            reminders: formData.reminders,
            momentDePrise: formData.momentDePrise,
          })
          .eq("id", formData.id)

      if (error) throw error

      Alert.alert("Succès", "Médicament mis à jour avec succès")
      setIsEditing(false)
    } catch (error) {
      console.error("Error:", error)
      Alert.alert("Erreur", "Échec de la mise à jour du médicament")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    Alert.alert("Confirmer la suppression", "Êtes-vous sûr de vouloir supprimer ce médicament ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          setIsLoading(true)
          try {
            const { error } = await supabase.from("medicaments").delete().eq("id", formData.id)

            if (error) throw error

            Alert.alert("Succès", "Médicament supprimé avec succès")
            router.back()
          } catch (error) {
            console.error("Error:", error)
            Alert.alert("Erreur", "Échec de la suppression du médicament")
          } finally {
            setIsLoading(false)
          }
        },
      },
    ])
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd-MM-yyyy", { locale: fr })
  }

  const handleDateChange = (event: any, selectedDate: Date | undefined, dateType: "start" | "end") => {
    if (selectedDate) {
      setFormData((prev) => ({
        ...prev,
        [dateType === "start" ? "startDate" : "endDate"]: selectedDate.toISOString().split("T")[0],
      }))
    }
    setShowStartDatePicker(false)
    setShowEndDatePicker(false)
  }

  const downloadFile = async (file: { uri: string; name: string }) => {
    try {
      const { data, error } = await supabase.storage.from("medicaments").createSignedUrl(file.uri, 3600)

      if (error) throw error

      const downloadResult = await FileSystem.downloadAsync(data.signedUrl, FileSystem.documentDirectory + file.name)

      if (downloadResult.status !== 200) {
        throw new Error("Download failed")
      }

      await Sharing.shareAsync(downloadResult.uri)
    } catch (error) {
      console.error("Error downloading file:", error)
      Alert.alert("Erreur", "Échec du téléchargement du fichier")
    }
  }

  return (
      <View className="flex-1 bg-gray-50">
        <View className="bg-white p-4 mb-4 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text className="text-xl font-bold">Détail du médicament</Text>
        </View>
        <ScrollView className="flex-1 px-4">
          <View className="space-y-4 pb-10">
            {/* Nom du médicament */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">Nom du médicament</Text>
              <View className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 h-12">
                <Pill size={20} color={colors.text} className="opacity-50" />
                <TextInput
                    value={formData.name}
                    onChangeText={(text) => setFormData((prev) => ({ ...prev, name: text }))}
                    placeholder="Nom du médicament"
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 ml-3"
                    editable={isEditing}
                />
              </View>
            </View>

            {/* Date de début */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">Date de début</Text>
              <TouchableOpacity
                  onPress={() => isEditing && setShowStartDatePicker(true)}
                  className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 h-12"
              >
                <Calendar size={20} color={colors.text} className="opacity-50" />
                <Text className="flex-1 ml-3 text-gray-700">{formatDate(formData.startDate)}</Text>
              </TouchableOpacity>
              {showStartDatePicker && (
                  <DateTimePicker
                      value={new Date(formData.startDate)}
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => handleDateChange(event, selectedDate, "start")}
                  />
              )}
            </View>

            {/* Date de fin */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">Date de fin</Text>
              <TouchableOpacity
                  onPress={() => isEditing && setShowEndDatePicker(true)}
                  className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 h-12"
              >
                <Calendar size={20} color={colors.text} className="opacity-50" />
                <Text className="flex-1 ml-3 text-gray-700">{formatDate(formData.endDate)}</Text>
              </TouchableOpacity>
              {showEndDatePicker && (
                  <DateTimePicker
                      value={new Date(formData.endDate)}
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => handleDateChange(event, selectedDate, "end")}
                  />
              )}
            </View>

            {/* Dosage */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">Dosage</Text>
              <View className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 h-12">
                <FlaskConical size={20} color={colors.text} className="opacity-50" />
                <TextInput
                    value={formData.dosage}
                    onChangeText={(text) => setFormData((prev) => ({ ...prev, dosage: text }))}
                    placeholder="Ex: 50 mg, 50 ml"
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 ml-3"
                    editable={isEditing}
                />
              </View>
            </View>

            {/* Stock */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">Stock</Text>
              <View className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 h-12">
                <Container size={20} color={colors.text} className="opacity-50" />
                <TextInput
                    value={formData.stock}
                    onChangeText={(text) => setFormData((prev) => ({ ...prev, stock: text }))}
                    placeholder="Ex: 50 comprimés"
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 ml-3"
                    editable={isEditing}
                />
              </View>
            </View>

            {/* Durée */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">Durée</Text>
              <View className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 h-12">
                <Timer size={20} color={colors.text} className="opacity-50" />
                <TextInput
                    value={formData.duration}
                    onChangeText={(text) => setFormData((prev) => ({ ...prev, duration: text }))}
                    placeholder="Ex: 10 jours"
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 ml-3"
                    editable={isEditing}
                />
              </View>
            </View>

            {/* Fréquence */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">Fréquence</Text>
              <View className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 h-12">
                <Repeat size={20} color={colors.text} className="opacity-50" />
                <TextInput
                    value={formData.frequency}
                    onChangeText={(text) => setFormData((prev) => ({ ...prev, frequency: text }))}
                    placeholder="Ex: X fois/jours, tous les jours"
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 ml-3"
                    editable={isEditing}
                />
              </View>
            </View>

            {/* Moment de prise */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">Moment de prise</Text>
              <View className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 h-12">
                <Clock size={20} color={colors.text} className="opacity-50" />
                <TextInput
                    value={formData.momentDePrise}
                    onChangeText={(text) => setFormData((prev) => ({ ...prev, momentDePrise: text }))}
                    placeholder="Ex: Avant le repas"
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 ml-3"
                    editable={isEditing}
                />
              </View>
            </View>

            {/* Rappels */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">Rappels</Text>
              <View className="bg-white rounded-xl border border-gray-200 p-4">
                {formData.reminders && formData.reminders.length > 0 ? (
                    formData.reminders.map((time, index) => (
                        <View key={index} className="flex-row items-center justify-between mb-2 bg-gray-50 p-3 rounded-lg">
                          <View className="flex-row items-center">
                            <Clock size={20} color={colors.text} className="opacity-50" />
                            <Text className="ml-3">{time}</Text>
                          </View>
                          {isEditing && (
                              <TouchableOpacity
                                  onPress={() => {
                                    const newReminders = [...formData.reminders]
                                    newReminders.splice(index, 1)
                                    setFormData((prev) => ({ ...prev, reminders: newReminders }))
                                  }}
                                  className="bg-gray-200 rounded-full p-2"
                              >
                                <X size={16} color={colors.text} />
                              </TouchableOpacity>
                          )}
                        </View>
                    ))
                ) : (
                    <Text className="text-gray-500">Aucun rappel configuré</Text>
                )}
                {isEditing && (
                    <TouchableOpacity
                        onPress={() => {
                          // Add new reminder logic here
                        }}
                        className="flex-row items-center justify-center py-3 mt-2 border-t border-gray-200"
                    >
                      <Text className="ml-2 text-primary-500 font-medium">Ajouter un rappel</Text>
                    </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Notes */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">Notes</Text>
              <View className="bg-white rounded-xl border border-gray-200 p-4">
                <TextInput
                    value={formData.notes}
                    onChangeText={(text) => setFormData((prev) => ({ ...prev, notes: text }))}
                    placeholder="Ajouter des notes..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={4}
                    className="min-h-[100] text-gray-700"
                    textAlignVertical="top"
                    editable={isEditing}
                />
              </View>
            </View>

            {/* Ordonnance */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">Ordonnance</Text>
              <View className="bg-white rounded-xl border border-gray-200 p-4">
                {formData?.uploads?.map((file, index) => (
                    <View key={index} className="flex-row items-center justify-between mb-2">
                      <Text className="text-gray-600">{file.name}</Text>
                      <TouchableOpacity onPress={() => downloadFile(file)}>
                        <FileText size={20} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                ))}
                {formData?.uploads?.length === 0 && <Text className="text-gray-500">Aucun fichier joint</Text>}
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row justify-between mt-6">
              {!isEditing ? (
                  <>
                    <TouchableOpacity onPress={() => setIsEditing(true)} className="bg-primary-500 px-4 py-2 rounded-xl">
                      <Text className="text-white">Modifier</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDelete} className="bg-red-500 px-4 py-2 rounded-xl">
                      <Text className="text-white">Supprimer</Text>
                    </TouchableOpacity>
                  </>
              ) : (
                  <TouchableOpacity
                      onPress={handleUpdate}
                      disabled={isLoading}
                      className="bg-primary-500 px-4 py-2 rounded-xl"
                  >
                    <Text className="text-white">{isLoading ? "Mise à jour..." : "Enregistrer"}</Text>
                  </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
  )
}

export default MedicamentDetail

