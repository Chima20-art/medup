import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Tabs } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {LucidePlusCircle, PlusIcon} from "lucide-react-native";

function CustomTabBar({ state, descriptors, navigation }: any) {
    const { colors } = useTheme();

    return (
        <View style={{
            flexDirection: 'row',
            backgroundColor: colors.card,
            height: 60,
            justifyContent: 'space-around',
            alignItems: 'center',
            paddingBottom: 5,
        }}>
            {state?.routes?.map((route: any, index: number) => {
                const { options } = descriptors[route.key];
                const label = options.tabBarLabel !== undefined ? options.tabBarLabel : options.title !== undefined ? options.title : route.name;

                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate({ name: route.name, merge: true });
                    }
                };

                if (route.name === 'add') {
                    return (
                        <TouchableOpacity
                            key={index}
                            onPress={onPress}
                            style={{
                                top: -20,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <View
                                style={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: 28,
                                    backgroundColor: colors.primary,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <PlusIcon size={30} color={colors.card} />
                            </View>
                        </TouchableOpacity>
                    );
                }

                let iconName;
                if (route.name === 'index') {
                    iconName = isFocused ? 'home' : 'home-outline';
                } else if (route.name === 'profile') {
                    iconName = isFocused ? 'person' : 'person-outline';
                } else {
                    iconName = 'ellipse-outline';
                }

                return (
                    <TouchableOpacity
                        key={index}
                        accessibilityRole="button"
                        accessibilityState={isFocused ? { selected: true } : {}}
                        accessibilityLabel={options.tabBarAccessibilityLabel}
                        testID={options.tabBarTestID}
                        onPress={onPress}
                        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' , paddingHorizontal: 15}}
                    >
                        <LucidePlusCircle
                            size={44}
                            color={isFocused ? colors.primary : colors.text}
                        />
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

export default function Layout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
            }}
            tabBar={(props) => <CustomTabBar {...props} />}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="add"
                options={{
                    title: 'Add',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="add-circle-outline" color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" color={color} size={size} />
                    ),
                }}
            />
        </Tabs>
    );
}