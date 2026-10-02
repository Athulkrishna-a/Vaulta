import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export function useHaptics() {
  const triggerImpact = async (style: ImpactStyle = ImpactStyle.Light) => {
    try {
      await Haptics.impact({ style });
    } catch (e) {
      // Haptics unavailable in browser, fallback silently
    }
  };

  const triggerNotification = async (type: NotificationType = NotificationType.Success) => {
    try {
      await Haptics.notification({ type });
    } catch (e) {
      // Browser fallback
    }
  };

  const triggerVibrate = async () => {
    try {
      await Haptics.vibrate();
    } catch (e) {
      // Browser fallback
    }
  };

  return {
    impactLight: () => triggerImpact(ImpactStyle.Light),
    impactMedium: () => triggerImpact(ImpactStyle.Medium),
    impactHeavy: () => triggerImpact(ImpactStyle.Heavy),
    notifySuccess: () => triggerNotification(NotificationType.Success),
    notifyWarning: () => triggerNotification(NotificationType.Warning),
    notifyError: () => triggerNotification(NotificationType.Error),
    vibrate: triggerVibrate,
  };
}
