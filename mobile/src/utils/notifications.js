import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const isExpoGo = Constants.appOwnership === 'expo' || Constants.executionEnvironment === 'storeClient';

// Configure default notification handler safely for native builds only
try {
  if (!isExpoGo && typeof Notifications.setNotificationHandler === 'function') {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }
} catch (err) {
  console.log('Notification handler configuration skipped in Expo Go:', err.message);
}

export const setupNotificationPermissions = async () => {
  if (isExpoGo || Platform.OS === 'web') return false;
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
  if (isExpoGo || Platform.OS === 'web') return;
  try {
    await setupNotificationPermissions();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Booking Confirmed! 🎉',
        body: `Your booking for "${eventName}" (${seatsCount} seat${seatsCount > 1 ? 's' : ''}) has been successfully confirmed.`,
        data: { eventName, seatsCount },
      },
      trigger: null, // Deliver immediately
    });
  } catch (error) {
    console.log('Failed to send booking notification:', error.message);
  }
};

export const sendCancellationNotification = async (eventName) => {
  if (isExpoGo || Platform.OS === 'web') return;
  try {
    await setupNotificationPermissions();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Booking Cancelled ℹ️',
        body: `Your booking for "${eventName}" has been cancelled. Your seats have been released.`,
        data: { eventName },
      },
      trigger: null, // Deliver immediately
    });
  } catch (error) {
    console.log('Failed to send cancellation notification:', error.message);
  }
};

