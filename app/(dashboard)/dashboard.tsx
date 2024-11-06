import React, { useRef } from 'react';
import { SignedIn, SignedOut, useUser, useAuth } from '@clerk/clerk-expo';
import {
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    View,
    TouchableOpacity
} from 'react-native';
import { router } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView, PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    runOnJS
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.28;
const CENTER_CIRCLE_SIZE = width * 0.32;
const SPRING_CONFIG = {
    damping: 20,
    stiffness: 90,
};

type CircleData = {
    id: number;
    icon: string;
    title: string;
    x: Animated.SharedValue<number>;
    y: Animated.SharedValue<number>;
};

const DraggableCircle = ({ data, onDrag, onDragEnd, circlesRef }: any) => {
    const { colors } = useTheme();
    const { id, icon, title, x, y } = data;

    const panGesture = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, { startX: number; startY: number }>({
        onStart: (_, context) => {
            context.startX = x.value;
            context.startY = y.value;
        },
        onActive: (event, context) => {
            const newX = context.startX + event.translationX;
            const newY = context.startY + event.translationY;
            runOnJS(onDrag)(id, newX, newY);
        },
        onEnd: () => {
            runOnJS(onDragEnd)(id);
        },
    });

    const rStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: withSpring(x.value, SPRING_CONFIG) },
                { translateY: withSpring(y.value, SPRING_CONFIG) },
            ],
        };
    });

    return (
        <PanGestureHandler onGestureEvent={panGesture}>
            <Animated.View style={[styles.circle, rStyle]}>
                <Ionicons name={icon} size={24} color={colors.primary} />
                <Text style={[styles.circleText, { color: colors.text }]} numberOfLines={2}>
                    {title}
                </Text>
            </Animated.View>
        </PanGestureHandler>
    );
};

export default function Page() {
    const { user } = useUser();
    const { signOut } = useAuth();
    const { colors } = useTheme();
    const circlesRef = useRef<CircleData[]>([
        { id: 1, icon: "flask-outline", title: "Examins biologiques", x: useSharedValue(0), y: useSharedValue(-CIRCLE_SIZE * 1.2) },
        { id: 2, icon: "scan-outline", title: "Examins radiologiques", x: useSharedValue(CIRCLE_SIZE * 1.2), y: useSharedValue(0) },
        { id: 3, icon: "document-text-outline", title: "Prescriptions", x: useSharedValue(CIRCLE_SIZE * 0.8), y: useSharedValue(CIRCLE_SIZE * 0.8) },
        { id: 4, icon: "medical-outline", title: "Consultations", x: useSharedValue(-CIRCLE_SIZE * 0.8), y: useSharedValue(CIRCLE_SIZE * 0.8) },
    ]);

    const handleSignOut = async () => {
        await signOut();
        router.replace('/sign-in');
    };

    const onDrag = (id: number, newX: number, newY: number) => {
        const draggedCircle = circlesRef.current.find(c => c.id === id);
        if (!draggedCircle) return;

        // Check collision with center circle
        const centerX = 0;
        const centerY = 0;
        const dx = newX - centerX;
        const dy = newY - centerY;
        const distanceToCenter = Math.sqrt(dx * dx + dy * dy);
        const minDistanceToCenter = (CIRCLE_SIZE + CENTER_CIRCLE_SIZE) / 2;

        if (distanceToCenter < minDistanceToCenter) {
            const angle = Math.atan2(dy, dx);
            newX = centerX + Math.cos(angle) * minDistanceToCenter;
            newY = centerY + Math.sin(angle) * minDistanceToCenter;
        }

        // Check collision with other circles
        circlesRef.current.forEach(circle => {
            if (circle.id !== id) {
                const dx = newX - circle.x.value;
                const dy = newY - circle.y.value;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = CIRCLE_SIZE;

                if (distance < minDistance) {
                    const angle = Math.atan2(dy, dx);
                    const pushDistance = (minDistance - distance) / 2;
                    newX += Math.cos(angle) * pushDistance;
                    newY += Math.sin(angle) * pushDistance;
                    circle.x.value -= Math.cos(angle) * pushDistance;
                    circle.y.value -= Math.sin(angle) * pushDistance;
                }
            }
        });

        // Update position
        draggedCircle.x.value = newX;
        draggedCircle.y.value = newY;
    };

    const onDragEnd = (id: number) => {
        // Animation is handled by the useAnimatedStyle in DraggableCircle
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
            >
                <View style={styles.header}>
                    <Text style={[styles.welcomeText, { color: colors.text }]}>
                        Bonjour, {user?.firstName}!
                    </Text>
                    <TouchableOpacity
                        style={[styles.logoutButton, { borderColor: colors.primary }]}
                        onPress={handleSignOut}
                    >
                        <Ionicons name="log-out-outline" size={20} color={colors.primary} />
                        <Text style={{ color: colors.primary, marginLeft: 5 }}>Logout</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.circleContainer}>
                    {circlesRef.current.map((circle) => (
                        <DraggableCircle
                            key={circle.id}
                            data={circle}
                            onDrag={onDrag}
                            onDragEnd={onDragEnd}
                            circlesRef={circlesRef}
                        />
                    ))}
                    <TouchableOpacity
                        style={[styles.centerCircle, { backgroundColor: colors.primary }]}
                        onPress={() => {}}
                    >
                        <Ionicons name="apps-outline" size={30} color="white" />
                        <Text style={[styles.circleText, { color: 'white' }]}>Accès rapide</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 80, // Account for tab bar
    },
    header: {
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderWidth: 1,
        borderRadius: 20,
    },
    circleContainer: {
        width: width * 0.9,
        height: width * 0.9,
        alignItems: 'center',
        justifyContent: 'center',
    },
    circle: {
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: CIRCLE_SIZE / 2,
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    centerCircle: {
        width: CENTER_CIRCLE_SIZE,
        height: CENTER_CIRCLE_SIZE,
        borderRadius: CENTER_CIRCLE_SIZE / 2,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        zIndex: 1,
    },
    circleText: {
        marginTop: 8,
        fontSize: 12,
        textAlign: 'center',
        fontWeight: '500',
    },
});