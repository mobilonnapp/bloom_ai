/**
 * RevenueCat IAP — native modül güvenli wrapper.
 * Expo Go'da native modül olmadığından tüm çağrılar sessizce atlanır.
 * EAS Build / npx expo run:ios ile gerçek cihazda çalışır.
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Expo Go'da native IAP çalışmaz — atla
const isExpoGo = Constants.appOwnership === 'expo';

// RevenueCat API Keys — RevenueCat dashboard'dan alın
const RC_IOS_KEY = 'appl_RclycLWlwtrCQiFXjejBeXRfEjV';
const RC_ANDROID_KEY = 'goog_BURAYA_ANDROID_KEY';

// Entitlement identifier — RevenueCat dashboard'da tanımladığınız isim
export const ENTITLEMENT_PRO = 'pro';

let Purchases: typeof import('react-native-purchases').default | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Purchases = require('react-native-purchases').default;
} catch {
  // Expo Go ortamında native modül yoktur — sessizce atlanır
}

/** Uygulama açılışında çağırın */
export async function initRevenueCat() {
  if (!Purchases || isExpoGo) return;
  try {
    const apiKey = Platform.OS === 'ios' ? RC_IOS_KEY : RC_ANDROID_KEY;
    await Purchases.configure({ apiKey });
  } catch (e) {
    console.warn('[RevenueCat] init error:', e);
  }
}

/** Mevcut abonelik durumunu kontrol eder */
export async function checkProStatus(): Promise<boolean> {
  if (!Purchases || isExpoGo) return false;
  try {
    const info = await Purchases.getCustomerInfo();
    return (
      typeof info.entitlements.active[ENTITLEMENT_PRO] !== 'undefined'
    );
  } catch {
    return false;
  }
}

/** Mevcut teklifleri (Offerings) getirir */
export async function getOfferings() {
  if (!Purchases || isExpoGo) return null;
  try {
    const offerings = await Purchases.getOfferings();
    console.log('[RC] offerings.current:', offerings.current?.identifier ?? 'null');
    console.log('[RC] all offerings keys:', Object.keys(offerings.all ?? {}));
    return offerings.current ?? null;
  } catch (e) {
    console.warn('[RC] getOfferings error:', e);
    return null;
  }
}

/** Bir paketi satın alır */
export async function purchasePackage(pkg: import('react-native-purchases').PurchasesPackage) {
  if (!Purchases || isExpoGo) throw new Error('RevenueCat not available');
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  const isPro = typeof customerInfo.entitlements.active[ENTITLEMENT_PRO] !== 'undefined';
  return { customerInfo, isPro };
}

/** Satın almaları geri yükler */
export async function restorePurchases() {
  if (!Purchases || isExpoGo) throw new Error('RevenueCat not available');
  const customerInfo = await Purchases.restorePurchases();
  const isPro = typeof customerInfo.entitlements.active[ENTITLEMENT_PRO] !== 'undefined';
  return { customerInfo, isPro };
}

/**
 * Uygulama açılışında çağrılır.
 * RevenueCat'ten abonelik durumunu kontrol eder, aktifse local storage'ı günceller.
 * Returns true if user is PRO.
 */
export async function syncProStatus(
  onProActive: (creditsToAdd: number) => Promise<void>,
  proCredits: number
): Promise<boolean> {
  const isPro = await checkProStatus();
  if (isPro) {
    await onProActive(proCredits);
  }
  return isPro;
}
