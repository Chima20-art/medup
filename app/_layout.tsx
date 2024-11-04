import * as SecureStore from 'expo-secure-store'
import {ClerkProvider, ClerkLoaded} from '@clerk/clerk-expo'
import {Slot} from "expo-router"
import {useColorScheme} from 'react-native'
import {DarkTheme, DefaultTheme, ThemeProvider} from "@react-navigation/native"
import "./global.css";

const tokenCache = {
    async getToken(key: string) {
        try {
            const item = await SecureStore.getItemAsync(key)
            if (item) {
                console.log(`${key} was used 🔐 \n`)
            } else {
                console.log('No values stored under key: ' + key)
            }
            return item
        } catch (error) {
            console.error('SecureStore get item error: ', error)
            await SecureStore.deleteItemAsync(key)
            return null
        }
    },
    async saveToken(key: string, value: string) {
        try {
            return SecureStore.setItemAsync(key, value)
        } catch (err) {
            return
        }
    },
}

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

if (!publishableKey) {
    throw new Error(
        'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env',
    )
}

export default function RootLayout() {
    const colorScheme = useColorScheme()

    return (
        <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <ClerkLoaded>
                    <Slot/>
                </ClerkLoaded>
            </ThemeProvider>
        </ClerkProvider>
    )
}