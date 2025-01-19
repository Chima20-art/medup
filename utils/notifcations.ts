
import { notificationStore$ } from "@/store/notification";
import * as Notifications from "expo-notifications";

// pass an id and title, body and date
// the function will schedule the notification at that date with the id  

export async function scheduleNotification(id:string,title: string, body: string,date: Date) {
    console.log('adding notifaction');
    try {

        let secondsToWait = Math.max(1, Math.floor((date.getTime() - new Date().getTime()) / 1000));

        console.log("secondsToWait", secondsToWait);

        let result = await Notifications.scheduleNotificationAsync({
    identifier: id,
      content: {
        title: title,
        body: body,
        //sound: "mySoundFile.wav", // Provide ONLY the base filename
      },
      trigger: {
        seconds: secondsToWait,
        channelId: "default",
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,

      },
    });

   if(result){
    notificationStore$.addNotification({
        id: id,
        title: title,
        body: body,
        date: date,
        isRead: false
    });
   }

        return true;
    } catch (error) {
        console.log('error scheduling notification', error);
        return false
    }

    
}

export async function cancelNotification(id:string) {
    try {
      let result = await Notifications.cancelScheduledNotificationAsync(id);
      return true;
    } catch (error) {
      console.log('error canceling notification', error);
      return false;
    }
}