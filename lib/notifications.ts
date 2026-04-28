/**
 * Thin wrapper around `expo-notifications`.
 *
 * The dep is NOT in the template's package.json on purpose — most generated
 * apps don't need notifications. We feature-detect at runtime: if the module
 * isn't installed, every export becomes a safe no-op so call sites don't
 * crash.
 *
 * To enable: `npx expo install expo-notifications` and add the plugin to
 * `app.json`. Then permissions + scheduling work without further changes.
 *
 * TODO: when adding to package.json, also wire `Notifications.setNotificationHandler`
 * in `app/_layout.tsx` so foreground notifications show as banners.
 */

type ExpoNotifications = {
  getPermissionsAsync: () => Promise<{ status: string; granted?: boolean }>;
  requestPermissionsAsync: () => Promise<{ status: string; granted?: boolean }>;
  scheduleNotificationAsync: (input: {
    content: { title?: string; body?: string };
    trigger: unknown;
  }) => Promise<string>;
  cancelScheduledNotificationAsync: (id: string) => Promise<void>;
  AndroidNotificationPriority?: { HIGH: unknown };
};

function load(): ExpoNotifications | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("expo-notifications") as ExpoNotifications;
  } catch {
    return null;
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  const N = load();
  if (!N) return false;
  try {
    const current = await N.getPermissionsAsync();
    if (current.granted || current.status === "granted") return true;
    const next = await N.requestPermissionsAsync();
    return next.granted || next.status === "granted";
  } catch {
    return false;
  }
}

/**
 * Schedule a daily local notification at "HH:mm" (24h, device local time).
 * Returns the scheduled id (or empty string if the dep is missing / failed).
 */
export async function scheduleDailyReminder(time: string, body: string): Promise<string> {
  const N = load();
  if (!N) return "";
  const [hStr, mStr] = time.split(":");
  const hour = Number(hStr);
  const minute = Number(mStr);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return "";

  try {
    return await N.scheduleNotificationAsync({
      content: { body },
      trigger: { hour, minute, repeats: true },
    });
  } catch {
    return "";
  }
}

export async function cancelReminder(id: string): Promise<void> {
  if (!id) return;
  const N = load();
  if (!N) return;
  try {
    await N.cancelScheduledNotificationAsync(id);
  } catch {
    /* swallow */
  }
}

/** True if `expo-notifications` is installed and importable. */
export function isNotificationsAvailable(): boolean {
  return load() !== null;
}
