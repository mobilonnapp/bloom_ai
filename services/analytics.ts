import { initializeApp, getApps } from 'firebase/app';
import { getAnalytics, logEvent, isSupported } from 'firebase/analytics';
import type { Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyBpWqZSRvi0o3JmmneIpSdpQLggbVcwmgM',
  projectId: 'bloom-ai-maker',
  storageBucket: 'bloom-ai-maker.firebasestorage.app',
  messagingSenderId: '558792021407',
  appId: '1:558792021407:ios:ba10d757bbdb71c214d9aa',
};

let analyticsInstance: Analytics | null = null;

async function getAnalyticsInstance(): Promise<Analytics | null> {
  try {
    if (!getApps().length) {
      initializeApp(firebaseConfig);
    }
    const supported = await isSupported();
    if (!supported) return null;
    if (!analyticsInstance) {
      analyticsInstance = getAnalytics();
    }
    return analyticsInstance;
  } catch {
    return null;
  }
}

export async function logScreenView(screenName: string) {
  try {
    const a = await getAnalyticsInstance();
    if (!a) return;
    logEvent(a, 'screen_view', { firebase_screen: screenName, firebase_screen_class: screenName });
  } catch {}
}

export async function logVideoCreated(templateId: string, templateTitle: string) {
  try {
    const a = await getAnalyticsInstance();
    if (!a) return;
    logEvent(a, 'video_created', { template_id: templateId, template_title: templateTitle });
  } catch {}
}

export async function logUpgradePressed(source: string) {
  try {
    const a = await getAnalyticsInstance();
    if (!a) return;
    logEvent(a, 'upgrade_pressed', { source });
  } catch {}
}

export async function logSubscriptionPurchased(plan: string, price: string) {
  try {
    const a = await getAnalyticsInstance();
    if (!a) return;
    logEvent(a, 'subscription_purchased', { plan, price });
  } catch {}
}

export async function logTutorialComplete() {
  try {
    const a = await getAnalyticsInstance();
    if (!a) return;
    logEvent(a, 'tutorial_complete');
  } catch {}
}
