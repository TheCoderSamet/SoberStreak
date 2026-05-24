import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const ANDROID_CHANNEL_ID = 'daily-reminder';

const MOTIVATION_BODIES = [
  'One moment at a time.',
  'Your progress still matters.',
  'Take a breath. This feeling will pass.',
] as const;

let handlerConfigured = false;

function pickMotivationBody(): string {
  const index = Math.floor(Math.random() * MOTIVATION_BODIES.length);
  return MOTIVATION_BODIES[index];
}

function ensureNotificationHandler(): void {
  if (handlerConfigured) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
  handlerConfigured = true;
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Daily Reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#BA7517',
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    ensureNotificationHandler();

    if (Platform.OS === 'web') {
      return false;
    }

    if (!Device.isDevice) {
      console.warn('Notifications work best on a physical device.');
      return false;
    }

    const existing = await Notifications.getPermissionsAsync();
    if (existing.granted) {
      return true;
    }

    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  } catch (error) {
    console.error('requestNotificationPermission failed:', error);
    return false;
  }
}

export async function scheduleDailyMotivationReminder(
  hour = 9,
  minute = 0
): Promise<void> {
  try {
    ensureNotificationHandler();
    await ensureAndroidChannel();

    await Notifications.cancelAllScheduledNotificationsAsync();

    const body = pickMotivationBody();
    const channelId = Platform.OS === 'android' ? ANDROID_CHANNEL_ID : undefined;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Sober Streak',
        body,
        sound: true,
        ...(channelId ? { channelId } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        ...(channelId ? { channelId } : {}),
      },
    });
  } catch (error) {
    console.error('scheduleDailyMotivationReminder failed:', error);
    throw error;
  }
}

export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('cancelAllNotifications failed:', error);
    throw error;
  }
}
