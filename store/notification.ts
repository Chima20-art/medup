import { observable } from "@legendapp/state";
import { syncObservable } from '@legendapp/state/sync'

import AsyncStorage from "@react-native-async-storage/async-storage";
import { ObservablePersistAsyncStorage } from "@legendapp/state/persist-plugins/async-storage";


// Type your Store interface
interface Notification {
  id: string;
  title: string;
  body:string;
  date:Date;
  isRead:boolean;
  
}

interface NotificationStore {
  notification: Notification[];
  unreadNotificationsNumber: number;
  markAsRead: (id: string) => void;
  addNotification: (notification: Notification) => void;
  pastNotifications: () => Notification[];

}

export const notificationStore$ = observable<NotificationStore>({
  notification: [],
  unreadNotificationsNumber: (): number => {
   
    let pastNotifications = notificationStore$.pastNotifications.get();
    return pastNotifications.filter((notification) => !notification.isRead).length;  

  },
  markAsRead: (id: string) => {
    const index = notificationStore$.notification.get().findIndex((notification) => notification.id === id);
    if (index !== -1) {
      notificationStore$.notification[index].set({
        ...notificationStore$.notification[index].get(),
        isRead: true
      });
    }
  },
  addNotification: (notification: Notification) => {
    notificationStore$.notification.push(notification);
  },
  pastNotifications: (): Notification[] => {
    return notificationStore$.notification.get().filter((notification) => notification.date.getTime() <= new Date().getTime());
  },
});


syncObservable(notificationStore$, {
    persist: {
        name: 'notificationStore',
        plugin: new ObservablePersistAsyncStorage({
      AsyncStorage,
    })
    }
})