"use client"
import { TouchableOpacity, Text, StyleSheet } from "react-native"
import { useTheme } from "@react-navigation/native"
// Comment out the problematic import
// import * as AppleAuthentication from 'expo-apple-authentication';

export default function AppleLoginButton() {
  const { colors } = useTheme()

  // Placeholder function instead of actual Apple authentication
  const handleAppleLogin = () => {
    alert("Apple login temporarily disabled for recording purposes")
  }

  return (
      <TouchableOpacity style={styles.button} onPress={handleAppleLogin}>
        <Text style={styles.buttonText}>Connexion avec Apple</Text>
      </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    height: 56,
    backgroundColor: "#000",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
})

