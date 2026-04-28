import * as Haptics from "expo-haptics";

/**
 * Semantic haptics. Use these instead of `expo-haptics` directly so that:
 *  - The vocabulary stays small (tap / success / warning / error / selection).
 *  - Future tweaks (intensity, suppress on Android, etc) live in one place.
 *
 * All calls are fire-and-forget; failures swallow.
 */

function safe(p: Promise<unknown>): void {
  p.catch(() => {});
}

/** Short tap feedback for primary actions (button press, list row tap). */
export function tap(): void {
  safe(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

/** Confirms a positive completion (save, sync done). */
export function success(): void {
  safe(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}

/** Soft alert for non-blocking issues. */
export function warning(): void {
  safe(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
}

/** Sharp alert for failures. */
export function error(): void {
  safe(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));
}

/** Toggles, segmented controls, scrolling pickers. */
export function selection(): void {
  safe(Haptics.selectionAsync());
}
