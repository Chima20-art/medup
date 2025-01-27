import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { supabase } from '@/utils/supabase';
import Google from '@/assets/images/google.svg';
import {router} from "expo-router"; // Assuming you have a Google icon

GoogleSignin.configure({
    webClientId: '131047050129-jso8d15n7cfploeo8p5irsua0a54k2u5.apps.googleusercontent.com',
    offlineAccess: true,
    iosClientId: '131047050129-c09od72q6va2145dgsf3pn9m9nrpb8e5.apps.googleusercontent.com',
});

const GoogleLoginButton = ({title}: {title: string}) => {
    const handleGoogleLogin = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            if (userInfo.data?.idToken) {
                const { data, error } = await supabase.auth.signInWithIdToken({
                    provider: 'google',
                    token: userInfo.data?.idToken,
                });
                router.replace("/dashboard");
                console.log(error, data);
            } else {
                throw new Error('No ID token present!');
            }
        } catch (error: any) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                // User cancelled the login flow
            } else if (error.code === statusCodes.IN_PROGRESS) {
                // Operation (e.g., sign-in) is in progress already
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                // Play services not available or outdated
            } else {
                // Some other error happened
            }
        }
    };

    return (
        <TouchableOpacity
            className="w-full h-14 bg-white  rounded-xl flex-row items-center justify-center space-x-2"
            onPress={handleGoogleLogin}
        >
            <Google width={20} height={20} />
            <Text className="text-black text-base font-semibold ml-2">
                {title}
            </Text>
        </TouchableOpacity>
    );
};

export default GoogleLoginButton;