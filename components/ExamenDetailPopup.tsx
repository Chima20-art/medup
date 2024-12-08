import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Animated, Dimensions } from 'react-native';
import { ChevronDown, Trash2, Eye, Download, Share2, User2, MapPin } from 'lucide-react-native';

const { height } = Dimensions.get('window');

export default function ExamenDetailPopup({ examen, slideAnim, onClose }: any) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const translateY = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [height, height * 0.01],
    });

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
            <View className="flex-1">
                <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
                    <Text className="text-xl font-bold text-indigo-600">{examen.name}</Text>
                    <TouchableOpacity onPress={onClose}>
                        <ChevronDown size={24} color="#4F46E5" />
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1 px-4 pt-4">
                    {/* Action Buttons */}
                    <View className="flex-row justify-end mb-4 bg-gray-100 rounded-full p-2">
                        <TouchableOpacity className="p-2">
                            <Trash2 size={20} color="#666" />
                        </TouchableOpacity>
                        <TouchableOpacity className="p-2">
                            <Eye size={20} color="#666" />
                        </TouchableOpacity>
                        <TouchableOpacity className="p-2">
                            <Download size={20} color="#666" />
                        </TouchableOpacity>
                        <TouchableOpacity className="p-2">
                            <Share2 size={20} color="#666" />
                        </TouchableOpacity>
                    </View>

                    {/* Image Preview */}
                    <View className="bg-white rounded-xl overflow-hidden mb-4">
                        <Image
                            source={{ uri: examen.images[currentImageIndex] }}
                            className="w-full h-48"
                            resizeMode="cover"
                        />
                        {/* Pagination Dots */}
                        <View className="flex-row justify-center mt-2 pb-2">
                            {examen.images.map((_: any, index: any) => (
                                <View
                                    key={index}
                                    className={`w-2 h-2 rounded-full mx-1 ${
                                        currentImageIndex === index ? 'bg-indigo-600' : 'bg-gray-300'
                                    }`}
                                />
                            ))}
                        </View>
                    </View>

                    {/* Location and Doctor Info */}
                    <View className="bg-white rounded-xl p-4 mb-4">
                        <View className="flex-row items-center mb-3">
                            <MapPin size={20} color="#666" />
                            <Text className="text-gray-600 ml-2">{examen.location}</Text>
                        </View>
                        <View className="flex-row items-center">
                            <User2 size={20} color="#666" />
                            <Text className="text-gray-600 ml-2">{examen.doctor}</Text>
                        </View>
                        <Text className="text-gray-400 text-sm mt-2">{examen.date}</Text>
                    </View>

                    {/* Notes Section */}

                </ScrollView>
            </View>
        </Animated.View>
    );
}