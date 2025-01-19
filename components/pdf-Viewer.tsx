import React from 'react';
import { View, Modal, TouchableOpacity, Text, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { X } from 'lucide-react-native';

interface PDFViewerProps {
    uri: string;
    isVisible: boolean;
    onClose: () => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ uri, isVisible, onClose }) => {
    const [isLoading, setIsLoading] = React.useState(true);

    return (
        <Modal
            animationType="slide"
            transparent={false}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
                    <Text className="text-lg font-semibold">PDF Viewer</Text>
                    <TouchableOpacity onPress={onClose}>
                        <X size={24} color="#000" />
                    </TouchableOpacity>
                </View>
                <View className="flex-1">
                    {isLoading && <LoadingSpinner />}
                    <WebView
                        source={{ uri: `https://docs.google.com/gview?embedded=true&url=${uri}` }}
                        onLoadEnd={() => setIsLoading(false)}
                        style={{ flex: 1 }}
                    />
                </View>
            </SafeAreaView>
        </Modal>
    );
};

