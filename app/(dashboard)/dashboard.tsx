import React from 'react';
import { SignedIn, SignedOut, useUser, useAuth } from '@clerk/clerk-expo';
import { Dimensions, KeyboardAvoidingView, Platform, StyleSheet, Text, View, Button } from 'react-native';
import {router} from "expo-router";

export default function Page() {
    const { user } = useUser();
    const { signOut } = useAuth();

    const handleSignOut = async () => {
        await signOut(); // Sign the user out
        router.replace('/sign-in'); // Redirect to sign-in screen
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <Text>Dashboard</Text>
            {user && (
                <View style={styles.userInfo}>
                    <Text>Welcome, {user.firstName}!</Text>
                    <Button title="Logout" onPress={() => handleSignOut()} />
                </View>
            )}
        </KeyboardAvoidingView>
    );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    userInfo: {
        marginTop: 20,
        alignItems: 'center',
    },
});
