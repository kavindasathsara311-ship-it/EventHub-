import Constants from 'expo-constants';
import { Platform } from 'react-native';

const isExpoGo = Constants.appOwnership === 'expo' || Constants.executionEnvironment === 'storeClient';

let Notifications = null;

// Only require expo-notifications in standalone native builds (not in Expo Go sandbox)
if (!isExpoGo && Platform.OS !== 'web') {
  try {
    Notifications = require('expo-notifications');
    if (Notifications && typeof Notifications.setNotificationHandler === 'function') {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
    }
  } catch (err) {
    console.log('Notification module load skipped:', err.message);
  }
}

export const setupNotificationPermissions = async () => {
  if (!Notifications) return false;
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  } catch (error) {
    console.log('Error requesting notification permissions:', error.message);
    return false;
  }
};

export const sendBookingNotification = async (eventName, seatsCount) => {
  if (!Notifications) return;
  try {
    await setupNotificationPermissions();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Booking Confirmed! 🎉',
        body: `Your booking for "${eventName}" (${seatsCount} seat${seatsCount > 1 ? 's' : ''}) has been successfully confirmed.`,
        data: { eventName, seatsCount },
      },
      trigger: null,
    });
  } catch (error) {
    console.log('Failed to send booking notification:', error.message);
  }
};

export const sendCancellationNotification = async (eventName) => {
  if (!Notifications) return;
  try {
    await setupNotificationPermissions();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Booking Cancelled ℹ️',
        body: `Your booking for "${eventName}" has been cancelled. Your seats have been released.`,
        data: { eventName },
      },
      trigger: null,
    });
  } catch (error) {
    console.log('Failed to send cancellation notification:', error.message);
  }
};
