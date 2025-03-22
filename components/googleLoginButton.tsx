import { TouchableOpacity, Text, StyleSheet } from "react-native"
import Google from "@/assets/images/google.svg"
// Comment out the problematic imports
// import * as WebBrowser from 'expo-web-browser';
// import * as Google from 'expo-auth-session/providers/google';

export default function GoogleLoginButton({ title = "Connexion avec Google" }) {
    // Placeholder function instead of actual Google authentication
    const handleGoogleLogin = () => {
        alert("Google login temporarily disabled for recording purposes")
    }

    return (
        <TouchableOpacity style={styles.button} onPress={handleGoogleLogin}>
            <Google width={20} height={20} />
            <Text style={styles.buttonText}>{title}</Text>
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
        marginBottom: 8,
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 8,
    },
})

