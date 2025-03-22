"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput, Modal } from "react-native"
import { useTheme } from "@react-navigation/native"
import { supabase } from "@/utils/supabase"
import { useRouter } from "expo-router"
import {
  Calendar,
  Clock,
  Edit2,
  FlaskConical,
  Pill,
  Repeat,
  Save,
  Trash2,
  X,
  Container,
  Timer,
  ChevronLeft,
  Plus,
} from "lucide-react-native"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import * as FileSystem from "expo-file-system"
import * as Sharing from "expo-sharing"
import DateTimePicker from "@react-native-community/datetimepicker"
import SupabaseFile from "@/components/supabaseFile"
import ReminderModal from "./ReminderModal"

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
    uploads: string[]
    momentDePrise: string
  }
}

const MedicamentDetail: React.FC<MedicamentDetailProps> = ({ initialData }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    ...initialData,
    startDate: initialData.startDate ? new Date(initialData.startDate).toISOString() : new Date().toISOString(),
    endDate: initialData.endDate ? new Date(initialData.endDate).toISOString() : new Date().toISOString(),
  });
  const [showStartDatePicker, setShowStartDatePicker] = useState(false)
  const [showEndDatePicker, setShowEndDatePicker] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showReminderModal, setShowReminderModal] = useState(false)
  const { colors } = useTheme()
  const router = useRouter()

  console.log("uploads ", formData.uploads)

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
    if (selectedDate && !isNaN(selectedDate.getTime())) {
      setFormData((prev) => ({
        ...prev,
        [dateType === "start" ? "startDate" : "endDate"]: selectedDate.toISOString(),
      }));
    }
    if (dateType === "start") {
      setShowStartDatePicker(false);
    } else {
      setShowEndDatePicker(false);
    }
  };


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

  const toggleEditing = () => {
    if (isEditing) {
      handleUpdate()
    } else {
      setIsEditing(true)
    }
  }

  const addReminder = (time: string) => {
    setFormData((prev) => ({
      ...prev,
      reminders: [...(prev.reminders || []), time],
    }))
  }

  const removeReminder = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      reminders: prev.reminders.filter((_, i) => i !== index),
    }))
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-6 pt-14 pb-6 bg-white">
        <View className="flex-row items-center justify-between pt-4">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
            >
              <ChevronLeft size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text className="font-bold text-xl text-primary-500 ml-2">Détails du médicament</Text>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={toggleEditing}
              className="w-10 h-10 items-center justify-center rounded-full bg-primary-100"
            >
              {isEditing ? <Save size={20} color={colors.primary} /> : <Edit2 size={20} color={colors.primary} />}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowDeleteConfirm(true)}
              className="w-10 h-10 items-center justify-center rounded-full bg-red-100"
            >
              <Trash2 size={20} color="rgb(220 38 38)" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <ScrollView className="flex-1 px-4 ">
        <View className="flex flex-col gap-y-6 pb-10">

          {/* Basic Information */}
          <View className="rounded-xl p-4 shadow-sm bg-primary-50">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Informations de base</Text>

            <View className="space-y-4">
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
                      className={`flex-1 ml-3 ${!isEditing ? "text-gray-700" : "text-gray-900"}`}
                      editable={isEditing}
                  />
                </View>
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
                      className={`flex-1 ml-3 ${!isEditing ? "text-gray-700" : "text-gray-900"}`}
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
                      className={`flex-1 ml-3 ${!isEditing ? "text-gray-700" : "text-gray-900"}`}
                      editable={isEditing}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Treatment Period */}
          <View className="rounded-xl p-4 shadow-sm bg-white">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Période de traitement</Text>
            <View>
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
            </View>
          </View>


          {/* Administration */}
          <View className="bg-primary-50 rounded-xl p-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Administration</Text>
            <View className="space-y-4">
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
                      className={`flex-1 ml-3 ${!isEditing ? "text-gray-700" : "text-gray-900"}`}
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
                      className={`flex-1 ml-3 ${!isEditing ? "text-gray-700" : "text-gray-900"}`}
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
                                <TouchableOpacity onPress={() => removeReminder(index)} className="bg-gray-200 rounded-full p-2">
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
                          onPress={() => setShowReminderModal(true)}
                          className="flex-row items-center justify-center py-3 mt-2 border-t border-gray-200"
                      >
                        <Plus size={20} color={colors.primary} />
                        <Text className="ml-2 text-primary-500 font-medium">Ajouter un rappel</Text>
                      </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Additional Information */}
          <View className="bg-white rounded-xl p-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Informations supplémentaires</Text>
            <View>
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
                      className={`min-h-[100] text-gray-700 ${!isEditing ? "text-gray-700" : "text-gray-900"}`}
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
                      <SupabaseFile path={file} bucket="medicaments" key={file} compact={true} />
                  ))}
                  {(formData?.uploads?.length === 0 || formData?.uploads === null)
                      && <Text className="text-gray-500">Aucun fichier joint</Text>}
                </View>
              </View>
              <Modal visible={showDeleteConfirm} transparent={true} animationType="fade">
                <View className="flex-1 bg-black/50 justify-center items-center p-4">
                  <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
                    <Text className="text-xl font-bold text-gray-900 mb-4">Confirmer la suppression</Text>
                    <Text className="text-gray-600 mb-6">
                      Êtes-vous sûr de vouloir supprimer ce médicament ? Cette action est irréversible.
                    </Text>
                    <View className="flex-row justify-end gap-4">
                      <TouchableOpacity onPress={() => setShowDeleteConfirm(false)} className="px-4 py-2 rounded-lg">
                        <Text className="text-gray-600">Annuler</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={handleDelete} className="px-4 py-2 bg-red-600 rounded-lg">
                        <Text className="text-white font-medium">Supprimer</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>
              <ReminderModal
                  visible={showReminderModal}
                  onClose={() => setShowReminderModal(false)}
                  onSave={(time) => {
                    addReminder(time)
                    setShowReminderModal(false)
                  }}
              />

            </View>
          </View>

        </View>

      </ScrollView>
    </View>
  )
}

export default MedicamentDetail

