import { DefaultTheme, Theme } from '@react-navigation/native';
import DarkTheme from "@react-navigation/native/src/theming/DarkTheme";

export const LightTheme: Theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: '#E91E63',
        background: '#f0f2f5',
        text: '#333',
        border: '#afacac',
        card: '#FFFFFF',
    },
};

export const DarkkTheme: Theme = {
    ...DarkTheme,
    colors: {
        ...DarkTheme.colors,
        primary: '#E91E63',
        background: '#1A1A1A',
        text: '#535353',
        border: '#afacac',
        card: '#2A2A2A',
    },
};