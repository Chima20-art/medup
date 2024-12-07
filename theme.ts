import { DefaultTheme, Theme } from '@react-navigation/native';
import DarkTheme from "@react-navigation/native/src/theming/DarkTheme";

export const LightTheme: Theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: '#5b7bf6',
        background: '#fff',
        text: '#333',
        border: '#afacac',
        card: '#FFFFFF',
    },
};

export const DarkkTheme: Theme = {
    ...DarkTheme,
    colors: {
        ...DarkTheme.colors,
        primary: '#2720ff',
        background: '#1A1A1A',
        text: '#535353',
        border: '#afacac',
        card: '#2A2A2A',
    },
};