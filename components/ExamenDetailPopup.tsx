import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import { Trash2, Eye, Download, Share2, Calendar, Building2, User2, ChevronDown } from 'lucide-react-native';
import SupabaseFile from "@/components/supabaseFile";
import {PanGestureHandler, State} from "react-native-gesture-handler";

const { height } = Dimensions.get('window');

interface ExamenDetailPopupProps {
    examen: any;
    slideAnim?: Animated.Value;
    onClose: () => void;
}

const ExamenDetailPopup: React.FC<ExamenDetailPopupProps> = ({ examen, slideAnim: propSlideAnim, onClose }) => {
    const [currentFileIndex, setCurrentFileIndex] = useState(0);
    const defaultSlideAnim = useRef(new Animated.Value(height)).current;
    const slideAnim = propSlideAnim || defaultSlideAnim;

    const translateY = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [height, 0],
    });

    React.useEffect(() => {
        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
        }).start();
    }, [slideAnim]);


    const handleGesture = (event: any) => {
        if (event.nativeEvent.state === State.END) {
            const { translationX } = event.nativeEvent;
            if (translationX < -10) {
                // Swipe left
                setCurrentFileIndex((prev) => Math.min(prev + 1, examen.uploads.length - 1));
            } else if (translationX > 10) {
                // Swipe right
                setCurrentFileIndex((prev) => Math.max(prev - 1, 0));
            }
        }
    };

    return (
        <Animated.View
            style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: height * 0.7,
                backgroundColor: 'white',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                transform: [{ translateY }],
                shadowColor: "#000",
                shadowOffset: {
                    width: 0,
                    height: -2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
            }}
        >
            {/* Header */}
            <View className="p-4 border-b border-gray-100">
                <View className="flex-row justify-between items-center">
                    <Text className="text-2xl font-bold text-indigo-600">Bilan général</Text>
                    <TouchableOpacity onPress={onClose}>
                        <ChevronDown size={24} color="#4F46E5" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Action Buttons */}
            <View className="px-4 py-2 flex-row justify-end space-x-2 bg-gray-50">
                <TouchableOpacity className="p-2">
                    <Trash2 size={20} color="#666666" />
                </TouchableOpacity>
                <TouchableOpacity className="p-2">
                    <Eye size={20} color="#666666" />
                </TouchableOpacity>
                <TouchableOpacity className="p-2">
                    <Download size={20} color="#666666" />
                </TouchableOpacity>
                <TouchableOpacity className="p-2">
                    <Share2 size={20} color="#666666" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-4">
                {/* File Preview */}
                <View className="border border-gray-200 rounded-xl p-2 mx-12">
                    {examen.uploads && examen.uploads.length > 0 && (
                                <View className="py-4">
                                    <PanGestureHandler onHandlerStateChange={handleGesture}>
                                        <View className="bg-gray-50 mb-2">
                                            <SupabaseFile path={examen.uploads[currentFileIndex]} />
                                        </View>
                                    </PanGestureHandler>
                                    {/* Pagination Dots */}
                                    {examen.uploads.length > 1 && (
                                        <View className="flex-row justify-center space-x-1">
                                            {examen.uploads.map((_: any, index: number) => (
                                                <TouchableOpacity
                                                    key={index}
                                                    onPress={() => setCurrentFileIndex(index)}
                                                    className={`w-2 h-2 rounded-full ${
                                                        currentFileIndex === index ? 'bg-indigo-600' : 'bg-gray-300'
                                                    }`}
                                                />
                                            ))}
                                        </View>
                                    )}
                                </View>
                            )}

                    {/* Details */}
                    <View className=" flex flex-col gap-y-3">
                        {/* Date */}
                            <Text className="text-gray-700">
                                {new Date(examen.date).toLocaleDateString()}
                            </Text>

                        {/* Laboratory */}
                            <Text className="font-bold text-gray-700">{examen.labName}</Text>

                        {/* Doctor */}
                            <Text className="text-gray-700">{examen.phone}</Text>
                    </View>
                </View>

                {/* Notes */}

                <View className="mx-4">

                    {examen.notes && (
                        <View className="mt-6">
                            <Text className="text-lg font-semibold mb-2">Notes:</Text>
                            <View className="bg-gray-50 rounded-xl p-4">
                                <Text className="text-gray-700">{examen.notes}</Text>
                            </View>
                        </View>
                    )}

                    {/* Files List */}
                    {examen.uploads && examen.uploads.length > 0 && (
                        <View className="mt-6">
                            <Text className="text-lg font-semibold mb-2">
                                Fichiers ({examen.uploads.length}):
                            </Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                className="flex-row space-x-3"
                            >
                                {examen.uploads.map((upload: string, index: number) => (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => setCurrentFileIndex(index)}
                                        className={`w-24 h-24 rounded-xl overflow-hidden ${
                                            currentFileIndex === index
                                                ? 'border-2 border-indigo-600'
                                                : 'border border-gray-200'
                                        }`}
                                    >
                                        <SupabaseFile path={upload} />
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </View>
            </ScrollView>
        </Animated.View>
    );
};

export default ExamenDetailPopup;
