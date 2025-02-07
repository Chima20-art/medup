"use client"

import React, { useState, useRef, useEffect } from 'react'
import { View, Text, TouchableOpacity, TextInput, Modal, StyleSheet } from 'react-native'
import { X } from 'lucide-react-native'

interface ReminderModalProps {
  visible: boolean
  onClose: () => void
  onSave: (time: string) => void
}

const ReminderModal: React.FC<ReminderModalProps> = ({ visible, onClose, onSave }) => {
  const [time, setTime] = useState('')
  const inputRef = useRef<TextInput>(null)

  useEffect(() => {
    if (visible) {
      setTime('')
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [visible])

  const handleTimeChange = (text: string) => {
    let formattedTime = text.replace(/[^0-9]/g, '')
    if (formattedTime.length > 2 && !formattedTime.includes(':')) {
      formattedTime = formattedTime.slice(0, 2) + ':' + formattedTime.slice(2)
    }
    if (formattedTime.length > 5) {
      formattedTime = formattedTime.slice(0, 5)
    }
    setTime(formattedTime)
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Ajouter un rappel</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.timeInputContainer}>
            <TextInput
              ref={inputRef}
              value={time}
              onChangeText={handleTimeChange}
              placeholder="23:55"
              placeholderTextColor="#9CA3AF"
              style={styles.timeInput}
              keyboardType="numeric"
              maxLength={5}
            />
          </View>

          <TouchableOpacity
            onPress={() => {
              onSave(time)
              onClose()
            }}
            className="bg-primary-500 py-4 rounded-xl"
          >
            <Text className="bg-primary-500 text-secondary text-center font-bold">Enregistrer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  timeInputContainer: {
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
    marginBottom: 24,
  },
  timeInput: {
    fontSize: 36,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    paddingVertical: 8,
  },
})

export default ReminderModal
