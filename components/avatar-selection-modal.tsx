import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Dimensions } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '@react-navigation/native';
import { avatars, DefaultAvatar } from '@/constants/avatars';

interface AvatarSelectionModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectAvatar: (avatarId: number) => void;
    username: string;
    currentAvatarId: number;
}

const AVATAR_SIZE = 60;
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const AVATAR_SPACING = 20;

export function AvatarSelectionModal({
                                         visible,
                                         onClose,
                                         onSelectAvatar,
                                         username,
                                         currentAvatarId
                                     }: AvatarSelectionModalProps) {
    const { colors } = useTheme();
    const scrollViewRef = useRef<ScrollView>(null);
    const [selectedId, setSelectedId] = useState<number>(currentAvatarId);

    const handleSelect = (id: number) => {
        setSelectedId(id);
        onSelectAvatar(id);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/50 justify-center items-center">
                <View className="w-[90%] max-w-md bg-white rounded-3xl p-6">
                    <TouchableOpacity
                        onPress={onClose}
                        className="absolute right-4 top-4 z-10"
                    >
                        <X size={24} color={colors.text} />
                    </TouchableOpacity>

                    {/* Default Avatar Section */}
                    <View className="items-center mb-6">
                        <View className="w-20 h-20 mb-4">
                            {selectedId === 13 ? (
                                <DefaultAvatar width={80} height={80} />
                            ) : (
                                avatars[selectedId]({ width: 80, height: 80 })
                            )}
                        </View>
                        <Text className="text-xl font-bold">
                            Bienvenue, {username} 👋
                        </Text>
                    </View>

                    {/* Avatar Selection List */}
                    <ScrollView
                        ref={scrollViewRef}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingHorizontal: SCREEN_WIDTH * 0.005,
                            paddingVertical:  SCREEN_HEIGHT * 0.02,
                            alignItems: 'center',
                        }}
                        snapToInterval={AVATAR_SIZE + AVATAR_SPACING}
                        decelerationRate="fast"
                    >
                        {Object.entries(avatars).map(([id, Avatar]) => {
                            const avatarId = Number(id);
                            const isSelected = selectedId === avatarId;
                            return (
                                <TouchableOpacity
                                    key={id}
                                    onPress={() => handleSelect(avatarId)}
                                    className={`mx-2.5 items-center justify-center`}
                                    style={{
                                        width: AVATAR_SIZE,
                                        height: AVATAR_SIZE,
                                    }}
                                >
                                    <View
                                        className={`rounded-full overflow-hidden ${
                                            isSelected ? 'border-2 border-blue-500' : ''
                                        }`}
                                    >
                                        <Avatar width={AVATAR_SIZE} height={AVATAR_SIZE} />
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}