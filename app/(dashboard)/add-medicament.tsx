import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
    TouchableWithoutFeedback,
    Modal,
    Animated,
    Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native";
import {
    ChevronLeft,
    Calendar,
    FileText,
    Clock,
    Pill,
    FileUp,
    ChevronDown, FlaskConical,
} from "lucide-react-native";
import * as DocumentPicker from "expo-document-picker";
import { supabase } from "@/utils/supabase";
import { Calendar as RNCalendar, LocaleConfig } from 'react-native-calendars';
import { Picker } from '@react-native-picker/picker';

// Configure French locale
LocaleConfig.locales['fr'] = {
    monthNames: ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
    monthNamesShort: ['Janv.','Févr.','Mars','Avril','Mai','Juin','Juil.','Août','Sept.','Oct.','Nov.','Déc.'],
    dayNames: ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'],
    dayNamesShort: ['Dim.','Lun.','Mar.','Mer.','Jeu.','Ven.','Sam.'],
    today: "Aujourd'hui"
};
LocaleConfig.defaultLocale = 'fr';

interface UploadedFile {
    uri: string;
    name: string;
}

export default function AddMedicament() {
    const router = useRouter();
    const { colors } = useTheme();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        startDate: "",
        endDate: "",
        dosage: "",
        notes: "",
        schedule: {
            morning: false,
            afternoon: false,
            evening: false,
            night: false,
        },
        file: null as UploadedFile | null,
        momentDePrise: "",
    });
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [showMomentDePrisePicker, setShowMomentDePrisePicker] = useState(false);
    const dropdownAnimation = useRef(new Animated.Value(0)).current;
    const momentDePriseInputRef = useRef(null);
    const [dropdownLayout, setDropdownLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });

    const momentDePriseOptions = [
        { label: "Avant le repas", value: "avant_le_repas" },
        { label: "Pendant le repas", value: "pendant_le_repas" },
        { label: "Après le repas", value: "apres_le_repas" },
        { label: "Non précisé", value: "non_precise" },
    ];

    useEffect(() => {
        if (showMomentDePrisePicker) {
            Animated.timing(dropdownAnimation, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(dropdownAnimation, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [showMomentDePrisePicker]);

    const pickDocument = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: "application/pdf",
        });

        if (result.assets && result.assets[0]) {
            setFormData((prev) => ({
                ...prev,
                file: {
                    uri: result.assets[0].uri,
                    name: result.assets[0].name,
                },
            }));
        }
    };

    const deleteFile = () => {
        setFormData((prev) => ({
            ...prev,
            file: null,
        }));
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "Sélectionner une date";
        const [year, month, day] = dateString.split("-");
        return `${day}-${month}-${year}`;
    };

    const onChangeStartDate = (date: any) => {
        setFormData((prev) => ({ ...prev, startDate: date.dateString }));
        setShowStartDatePicker(false);
    };

    const onChangeEndDate = (date: any) => {
        setFormData((prev) => ({ ...prev, endDate: date.dateString }));
        setShowEndDatePicker(false);
    };

    const handleSubmit = async () => {
        setIsLoading(true);

        const { data: userData, error: userError } = await supabase.auth.getUser();
        let userId = userData?.user?.id;

        if (!userId) {
            console.log("No user id found");
            setIsLoading(false);
            return;
        }

        try {
            let filePath = null;
            if (formData.file) {
                const fileName = formData.file.uri.split("/").pop();
                if (fileName) {
                    filePath = `${userId}/${Date.now()}_${fileName}`;
                    const response = await fetch(formData.file.uri);
                    const blob = await response.blob();

                    const { error: uploadError } = await supabase.storage
                        .from("medicaments")
                        .upload(filePath, blob);

                    if (uploadError) {
                        console.error("Upload error:", uploadError);
                        throw uploadError;
                    }
                }
            }

            const { error } = await supabase
                .from("medicaments")
                .insert({
                    name: formData.name,
                    startDate: formData.startDate,
                    endDate: formData.endDate,
                    dosage: formData.dosage,
                    notes: formData.notes,
                    schedule: formData.schedule,
                    file: filePath,
                    user_id: userId,
                    created_at: new Date(),
                    momentDePrise: formData.momentDePrise,
                });

            if (error) throw error;

            Alert.alert("Success", "Medication added successfully");
            router.push("/list-medicaments");
        } catch (error) {
            console.error("Error:", error);
            Alert.alert("Error", "Failed to save medication. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMomentDePrisePicker = () => {
        if (momentDePriseInputRef.current) {
            momentDePriseInputRef.current.measure((x, y, width, height, pageX, pageY) => {
                setDropdownLayout({ x: pageX, y: pageY + height, width, height });
                setShowMomentDePrisePicker(!showMomentDePrisePicker);
            });
        }
    };

    const renderMomentDePrisePicker = () => (
        <Modal
            visible={showMomentDePrisePicker}
            transparent={true}
            animationType="none"
        >
            <TouchableWithoutFeedback onPress={() => setShowMomentDePrisePicker(false)}>
                <View style={{ flex: 1 }}>
                    <Animated.View
                        style={{
                            position: 'absolute',
                            left: dropdownLayout.x,
                            top: dropdownLayout.y,
                            width: dropdownLayout.width,
                            backgroundColor: 'white',
                            borderRadius: 8,
                            shadowColor: "#000",
                            shadowOffset: {
                                width: 0,
                                height: 2,
                            },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,
                            elevation: 5,
                            opacity: dropdownAnimation,
                            transform: [
                                {
                                    translateY: dropdownAnimation.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [-20, 0],
                                    }),
                                },
                            ],
                        }}
                    >
                        {momentDePriseOptions.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                onPress={() => {
                                    setFormData((prev) => ({ ...prev, momentDePrise: option.value }));
                                    setShowMomentDePrisePicker(false);
                                }}
                                style={{
                                    paddingVertical: 12,
                                    paddingHorizontal: 16,
                                    borderBottomWidth: 1,
                                    borderBottomColor: '#e0e0e0',
                                    backgroundColor: formData.momentDePrise === option.value ? colors.primary : 'white',
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 16,
                                        color: formData.momentDePrise === option.value ? colors.secondary : colors.text,
                                    }}
                                >
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </Animated.View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );

    return (
        <TouchableWithoutFeedback onPress={() => {
            setShowStartDatePicker(false);
            setShowEndDatePicker(false);
            setShowMomentDePrisePicker(false);
        }}>
            <View className="flex-1 bg-gray-50">
                <View className="px-6 pt-14 pb-6 bg-white">
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
                        >
                            <ChevronLeft size={24} color={colors.text} />
                        </TouchableOpacity>
                        <Text className="font-bold text-xl font-semibold text-gray-900 ml-4">
                            Ajouter un médicament
                        </Text>
                    </View>
                </View>

                <ScrollView className="flex-1 p-6">
                    <View className="space-y-4">
                        {/* Name Input */}
                        <View>
                            <Text className="text-sm font-medium text-gray-700 mb-1">
                                Nom du médicament
                            </Text>
                            <View className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 h-12">
                                <Pill size={20} color={colors.text} className="opacity-50" />
                                <TextInput
                                    value={formData.name}
                                    onChangeText={(text) =>
                                        setFormData((prev) => ({ ...prev, name: text }))
                                    }
                                    placeholder="Nom du médicament"
                                    placeholderTextColor="#9CA3AF"
                                    className="flex-1 ml-3"
                                />
                            </View>
                        </View>

                        {/* Start Date Input */}
                        <View>
                            <Text className="text-sm font-medium text-gray-700 mb-1">
                                Date de début
                            </Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowStartDatePicker(!showStartDatePicker);
                                    setShowEndDatePicker(false);
                                }}
                                className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 h-12"
                            >
                                <Calendar size={20} color={colors.text} className="opacity-50" />
                                <Text className="flex-1 ml-3 text-gray-700">
                                    {formatDate(formData.startDate)}
                                </Text>
                            </TouchableOpacity>
                            {showStartDatePicker && (
                                <View className="absolute z-10 mt-1 w-full bg-white rounded-xl shadow-lg">
                                    <RNCalendar
                                        onDayPress={(day) => {
                                            onChangeStartDate(day);
                                        }}
                                        markedDates={{
                                            [formData.startDate]: { selected: true, selectedColor: colors.primary }
                                        }}
                                        theme={{
                                            backgroundColor: '#ffffff',
                                            calendarBackground: '#ffffff',
                                            textSectionTitleColor: colors.text,
                                            selectedDayBackgroundColor: colors.primary,
                                            selectedDayTextColor: '#ffffff',
                                            todayTextColor: colors.primary,
                                            dayTextColor: colors.text,
                                            textDisabledColor: '#d9e1e8',
                                            dotColor: colors.primary,
                                            selectedDotColor: '#ffffff',
                                            arrowColor: colors.text,
                                            monthTextColor: colors.text,
                                            indicatorColor: 'blue',
                                            textDayFontFamily: 'System',
                                            textMonthFontFamily: 'System',
                                            textDayHeaderFontFamily: 'System',
                                            textDayFontWeight: '300',
                                            textMonthFontWeight: 'bold',
                                            textDayHeaderFontWeight: '300',
                                            textDayFontSize: 16,
                                            textMonthFontSize: 16,
                                            textDayHeaderFontSize: 16
                                        }}
                                    />
                                </View>
                            )}
                        </View>

                        {/* End Date Input */}
                        <View>
                            <Text className="text-sm font-medium text-gray-700 mb-1">
                                Date de fin
                            </Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowEndDatePicker(!showEndDatePicker);
                                    setShowStartDatePicker(false);
                                }}
                                className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 h-12"
                            >
                                <Calendar size={20} color={colors.text} className="opacity-50" />
                                <Text className="flex-1 ml-3 text-gray-700">
                                    {formatDate(formData.endDate)}
                                </Text>
                            </TouchableOpacity>
                            {showEndDatePicker && (
                                <View className="absolute z-10 mt-1 w-full bg-white rounded-xl shadow-lg">
                                    <RNCalendar
                                        onDayPress={(day) => {
                                            onChangeEndDate(day);
                                        }}
                                        markedDates={{
                                            [formData.endDate]: { selected: true, selectedColor: colors.primary }
                                        }}
                                        theme={{
                                            backgroundColor: '#ffffff',
                                            calendarBackground: '#ffffff',
                                            textSectionTitleColor: colors.text,
                                            selectedDayBackgroundColor: colors.primary,
                                            selectedDayTextColor: '#ffffff',
                                            todayTextColor: colors.primary,
                                            dayTextColor: colors.text,
                                            textDisabledColor: '#d9e1e8',
                                            dotColor: colors.primary,
                                            selectedDotColor: '#ffffff',
                                            arrowColor: colors.text,
                                            monthTextColor: colors.text,
                                            indicatorColor: 'blue',
                                            textDayFontFamily: 'System',
                                            textMonthFontFamily: 'System',
                                            textDayHeaderFontFamily: 'System',
                                            textDayFontWeight: '300',
                                            textMonthFontWeight: 'bold',
                                            textDayHeaderFontWeight: '300',
                                            textDayFontSize: 16,
                                            textMonthFontSize: 16,
                                            textDayHeaderFontSize: 16
                                        }}
                                    />
                                </View>
                            )}
                        </View>

                        {/* Dosage Input */}
                        <View>
                            <Text className="text-sm font-medium text-gray-700 mb-1">
                                Dosage
                            </Text>
                            <View className="flex-row items-center bg-white rounded-xl border border-gray-200 px-4 h-12">
                                <FlaskConical size={20} color={colors.text} className="opacity-50" />
                                <TextInput
                                    value={formData.dosage}
                                    onChangeText={(text) =>
                                        setFormData((prev) => ({ ...prev, dosage: text }))
                                    }
                                    placeholder="Ex: 1 comprimé"
                                    placeholderTextColor="#9CA3AF"
                                    className="flex-1 ml-3"
                                />
                            </View>
                        </View>

                        {/* Moment de prise Input */}
                        <View>
                            <Text className="text-sm font-medium text-gray-700 mb-1">
                                Moment de prise
                            </Text>
                            <TouchableOpacity
                                ref={momentDePriseInputRef}
                                onPress={toggleMomentDePrisePicker}
                                className="flex-row items-center justify-between bg-white rounded-xl border border-gray-200 px-4 h-12"
                            >
                                <View className="flex-row items-center">
                                    <Clock size={20} color={colors.text} className="opacity-50" />
                                    <Text className="ml-3 text-gray-700">
                                        {formData.momentDePrise
                                            ? momentDePriseOptions.find(option => option.value === formData.momentDePrise)?.label
                                            : "Sélectionner le moment"}
                                    </Text>
                                </View>
                                <ChevronDown size={20} color={colors.text} className="opacity-50" />
                            </TouchableOpacity>
                        </View>

                        {/* Schedule Selection */}
                        <View>
                            <Text className="text-sm font-medium text-gray-700 mb-1">
                                Horaire de prise
                            </Text>
                            <View className="bg-white rounded-xl border border-gray-200 p-4">
                                <View className="flex-row flex-wrap gap-2">
                                    {Object.entries(formData.schedule).map(([time, isSelected]) => (
                                        <TouchableOpacity
                                            key={time}
                                            onPress={() =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    schedule: {
                                                        ...prev.schedule,
                                                        [time]: !isSelected,
                                                    },
                                                }))
                                            }
                                            className={`px-4 py-2 rounded-full border ${
                                                isSelected
                                                    ? "bg-indigo-600 border-indigo-600"
                                                    : "border-gray-300"
                                            }`}
                                        >
                                            <Text
                                                className={`text-sm ${
                                                    isSelected ? "text-white" : "text-gray-700"
                                                }`}
                                            >
                                                {time.charAt(0).toUpperCase() + time.slice(1)}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </View>

                        {/* Notes Input */}
                        <View>
                            <Text className="text-sm font-medium text-gray-700 mb-1">
                                Notes
                            </Text>
                            <View className="bg-white rounded-xl border border-gray-200 p-4">
                                <TextInput
                                    value={formData.notes}
                                    onChangeText={(text) =>
                                        setFormData((prev) => ({ ...prev, notes: text }))
                                    }
                                    placeholder="Ajouter des notes..."
                                    placeholderTextColor="#9CA3AF"
                                    multiline
                                    numberOfLines={4}
                                    className="min-h-[100] text-gray-700"
                                    textAlignVertical="top"
                                />
                            </View>
                        </View>

                        {/* File Upload Section */}
                        <View>
                            <Text className="text-sm font-medium text-gray-700 mb-1">
                                Ordonnance
                            </Text>
                            <View className="bg-white rounded-xl border border-gray-200 p-4">
                                {formData.file ? (
                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-row items-center">
                                            <FileText size={20} color={colors.text} />
                                            <Text className="ml-2 text-sm text-gray-600">
                                                {formData.file.name}
                                            </Text>
                                        </View>
                                        <TouchableOpacity
                                            onPress={deleteFile}
                                            className="p-2 bg-red-100 rounded-full"
                                        >
                                            <Text className="text-red-600">Supprimer</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        onPress={pickDocument}
                                        className="flex-row items-center justify-center py-4 border-2 border-dashed border-gray-300 rounded-lg"
                                    >
                                        <FileUp size={20} color={colors.text} className="opacity-50" />
                                        <Text className="ml-2 text-sm text-gray-600">
                                            Ajouter une ordonnance
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </View>
                </ScrollView>

                <View className="p-6 bg-white border-t border-gray-200">
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={isLoading}
                        className={`w-full rounded-xl py-3 items-center ${
                            isLoading ? "bg-indigo-400" : "bg-indigo-600"
                        }`}
                    >
                        <Text className="text-white font-semibold text-lg">
                            {isLoading ? "Chargement..." : "Enregistrer"}
                        </Text>
                    </TouchableOpacity>
                </View>
                {renderMomentDePrisePicker()}
            </View>
        </TouchableWithoutFeedback>
    );
}

