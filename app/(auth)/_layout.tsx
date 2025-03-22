"use client"

import { supabase } from "@/utils/supabase"
import { Stack, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { View, Text, ActivityIndicator } from "react-native"

export default function GuestLayout() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        setIsLoading(true)
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        console.log("Auth check - user:", user ? "Found" : "Not found")
        if (error) console.log("Auth check - error:", error.message)

        // If user is authenticated, redirect to dashboard
        if (!error && user) {
          router.replace("/dashboard")
        }
      } catch (err) {
        console.error("Auth check failed:", err)
        // In case of error, we'll just continue to the auth screens
      } finally {
        setIsLoading(false)
      }
    }

    getUser()
  }, [])

  // Show a loading indicator while checking auth status
  if (isLoading) {
    return (
        <View style={ {flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={{ marginTop: 10, color: "#666" }}>Vérification de l'authentification...</Text>
        </View>
    )
  }

  return (
      <Stack
          screenOptions={{
            headerShown: false,
          }}
      />
  )
}

