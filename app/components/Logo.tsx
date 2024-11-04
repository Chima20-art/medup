import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function Logo() {
    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Text style={styles.logoTextBold}>MED</Text>
                <Text style={styles.logoTextLight}>up</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginBottom: 10,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 0,
    },
    logoTextBold: {
        fontSize: 32,
        fontWeight: '700',
        color: '#1A1A1A',
        letterSpacing: -0.5,
    },
    logoTextLight: {
        fontSize: 32,
        fontWeight: '400',
        color: '#1A1A1A',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 20,
        color: '#666666',
        fontWeight: '400',
    },
})