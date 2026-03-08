/**
 * Meta (Facebook) SDK — native modül güvenli wrapper.
 * Expo Go'da native modül olmadığından tüm çağrılar sessizce atlanır.
 * EAS Build / npx expo run:ios ile gerçek cihazda çalışır.
 */

let SDK: typeof import('react-native-fbsdk-next') | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  SDK = require('react-native-fbsdk-next');
} catch {
  // Expo Go ortamında native modül yoktur — hata bastırılır
}

export async function initFacebook() {
  try {
    await SDK?.Settings?.initializeSDK?.();
  } catch {
    // no-op
  }
}

export function logVideoCreated(templateId: string) {
  try {
    SDK?.AppEventsLogger?.logEvent('video_created', { template_id: templateId });
  } catch {
    // no-op
  }
}

export function logUpgradePressed() {
  try {
    SDK?.AppEventsLogger?.logEvent('upgrade_pressed');
  } catch {
    // no-op
  }
}

export function logSubscriptionPurchased(plan: string) {
  try {
    SDK?.AppEventsLogger?.logEvent('subscription_purchased', { plan });
  } catch {
    // no-op
  }
}

export function logPurchase(amount: number, currency = 'USD') {
  try {
    SDK?.AppEventsLogger?.logPurchase(amount, currency);
  } catch {
    // no-op
  }
}
