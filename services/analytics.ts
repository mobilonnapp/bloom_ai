import analytics from '@react-native-firebase/analytics';

export async function logScreenView(screenName: string) {
  try {
    await analytics().logScreenView({ screen_name: screenName, screen_class: screenName });
  } catch {}
}

export async function logVideoCreated(templateId: string, templateTitle: string) {
  try {
    await analytics().logEvent('video_created', { template_id: templateId, template_title: templateTitle });
  } catch {}
}

export async function logUpgradePressed(source: string) {
  try {
    await analytics().logEvent('upgrade_pressed', { source });
  } catch {}
}

export async function logSubscriptionPurchased(plan: string, price: string) {
  try {
    await analytics().logEvent('subscription_purchased', { plan, price });
  } catch {}
}

export async function logTutorialComplete() {
  try {
    await analytics().logTutorialComplete();
  } catch {}
}
