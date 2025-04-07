import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Image } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '@react-navigation/native';
import { avatars, DefaultAvatar } from '@/constants/avatars';
import MedupHand from "@/assets/images/MedupHand.svg";

interface AvatarSelectionModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectAvatar: (avatarId: number) => void;
    username: string;
    currentAvatarId: number;
}

const AVATAR_SIZE = 60;

export function AvatarSelectionModal({
                                         visible,
                                         onClose,
                                         onSelectAvatar,
                                         username,
                                         currentAvatarId
                                     }: AvatarSelectionModalProps) {
    const { colors } = useTheme();
    const [selectedId, setSelectedId] = useState<number>(currentAvatarId);
    // State to force re-renders of individual avatars
    const [renderedAvatars, setRenderedAvatars] = useState<{[key: number]: boolean}>({});

    // Force re-render of all avatars when modal becomes visible
    useEffect(() => {
        if (visible) {
            // Reset rendered state
            setRenderedAvatars({});

            // Force render each avatar with a delay
            Object.keys(avatars).forEach((id, index) => {
                const numId = Number(id);
                setTimeout(() => {
                    setRenderedAvatars(prev => ({
                        ...prev,
                        [numId]: true
                    }));
                }, index * 100); // 100ms delay between each avatar
            });
        }
    }, [visible]);

    const handleSelect = (id: number) => {
        setSelectedId(id);
        onSelectAvatar(id);
    };

    // Create individual avatar components
    const renderAvatar = (id: number, isSelected: boolean) => {
        const avatarSource = avatars[id];
        const shouldRender = renderedAvatars[id] || id <= 2; // Always render first two

        return (
            <TouchableOpacity
                key={id}
                onPress={() => handleSelect(id)}
                style={{
                    width: AVATAR_SIZE,
                    height: AVATAR_SIZE,
                    marginHorizontal: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <View
                    style={{
                        width: AVATAR_SIZE,
                        height: AVATAR_SIZE,
                        borderRadius: AVATAR_SIZE / 2,
                        borderWidth: isSelected ? 2 : 0,
                        borderColor: '#3b82f6',
                        overflow: 'hidden',
                        backgroundColor: '#f3f4f6',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    {shouldRender && (
                        <Image
                            source={avatarSource}
                            style={{
                                width: AVATAR_SIZE,
                                height: AVATAR_SIZE,
                            }}
                            key={`avatar-${id}-${visible}-${shouldRender}`}
                        />
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={{
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.5)',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <View style={{
                    width: '90%',
                    maxWidth: 400,
                    backgroundColor: 'white',
                    borderRadius: 24,
                    padding: 24
                }}>
                    <TouchableOpacity
                        onPress={onClose}
                        style={{
                            position: 'absolute',
                            right: 16,
                            top: 16,
                            zIndex: 10
                        }}
                    >
                        <X size={24} color={colors.text} />
                    </TouchableOpacity>

                    {/* Default Avatar Section */}
                    <View style={{ alignItems: 'center', marginBottom: 24 }}>
                        <View style={{
                            width: 80,
                            height: 80,
                            marginBottom: 16,
                            backgroundColor: '#f3f4f6',
                            borderRadius: 40,
                            overflow: 'hidden',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <Image
                                source={selectedId === 13 ? DefaultAvatar : avatars[selectedId]}
                                style={{
                                    width: 80,
                                    height: 80,
                                }}
                                key={`selected-avatar-${selectedId}-${visible}`}
                            />
                        </View>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'flex-end',
                            gap: 8
                        }}>
                            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
                                Bienvenue, {username}
                            </Text>
                            <MedupHand height={36} width={36}/>
                        </View>
                    </View>

                    {/* Avatar Selection List */}
                    <View style={{ height: 80 }}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{
                                paddingVertical: 10,
                                alignItems: 'center',
                                paddingHorizontal: 10,
                            }}
                        >
                            {Object.keys(avatars).map((id) => {
                                const avatarId = Number(id);
                                const isSelected = selectedId === avatarId;
                                return renderAvatar(avatarId, isSelected);
                            })}
                        </ScrollView>
                    </View>
                </View>
            </View>
        </Modal>
    );
}