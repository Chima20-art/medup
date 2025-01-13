import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { use$ } from "@legendapp/state/react";
import { Notification, notificationStore$ } from "@/store/notification";

export default function Notifaction() {
  const pastNotifications = use$(() =>
    notificationStore$.pastNotifications.get()
  );

  const renderNotification = ({
    item: notification,
  }: {
    item: Notification;
  }) => (
    <TouchableOpacity
      key={notification.id}
      className={`${
        !notification.isRead ? "bg-blue-50" : "bg-white"
      } rounded-lg p-4 mx-6 mb-3 shadow-sm border border-gray-100`}
      onPress={() => {
        notificationStore$.markAsRead(notification.id);
      }}
    >
      <Text className="text-lg font-semibold text-gray-900 mb-1">
        {notification.title}
      </Text>
      <Text className="text-gray-600 mb-2">{notification.body}</Text>
      <Text className="text-sm text-gray-400">
        {notification.date.toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  const handleMarkAllAsRead = () => {
    pastNotifications.forEach((notification) => {
      notificationStore$.markAsRead(notification.id);
    });
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-6 pt-14 pb-4 bg-white shadow-sm">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold text-gray-900">
            Notifications
          </Text>
          <TouchableOpacity
            onPress={handleMarkAllAsRead}
            className="bg-blue-500 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-medium">Mark all as read</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={pastNotifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerClassName="pt-4"
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
