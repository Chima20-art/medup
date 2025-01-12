import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { use$ } from "@legendapp/state/react";
import { notificationStore$ } from "@/store/notification";

export default function Notifaction() {
  const pastNotifications = use$(() =>
    notificationStore$.pastNotifications.get()
  );

  console.log("pastNotifications", JSON.stringify(pastNotifications, null, 2));

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-6 pt-14 pb-6 bg-white">
        <Text className="text-2xl font-bold text-gray-900 mb-4">
          Notifications
        </Text>
        {pastNotifications.map((notification) => (
          <TouchableOpacity
            key={notification.id}
            className={`${
              !notification.isRead ? "bg-blue-50" : "bg-white"
            } rounded-lg p-4 mb-3 shadow-sm`}
            onPress={() => {
              notificationStore$.markAsRead(notification.id);
            }}
          >
            <Text className="text-lg font-bold text-gray-900 mb-1">
              {notification.title}
            </Text>
            <Text className="text-gray-600 mb-2">{notification.body}</Text>
            <Text className="text-sm text-gray-400">
              {notification.date.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
