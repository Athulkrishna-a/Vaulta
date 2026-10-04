import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useAppData } from '../app/providers/AppDataProvider';

export function useHaptics(isNavbar: boolean = false) {
  let isHapticsEnabled = true;
  try {
    const { settings } = useAppData();
    if (settings && settings.haptics === false) {
      isHapticsEnabled = false;
    }
  } catch (e) {
    // Fallback if hook is called outside AppDataProvider context
  }

  // Low-level reduced impact trigger (always Light style or 6ms micro-vibration for web)
  const triggerImpact = async () => {
    // Only trigger vibration if enabled and specifically called from the Navbar
    if (!isNavbar || !isHapticsEnabled) return;

    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
      // Browser web fallback with ultra-light duration (6ms)
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(6);
        } catch (_) {}
      }
    }
  };

  return {
    impactLight: triggerImpact,
    impactMedium: triggerImpact,
    impactHeavy: triggerImpact,
    notifySuccess: triggerImpact,
    notifyWarning: triggerImpact,
    notifyError: triggerImpact,
    vibrate: triggerImpact,
  };
}
