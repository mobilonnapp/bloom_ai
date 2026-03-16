import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Colors } from '../constants/colors';
import { SUBSCRIPTION_PLANS } from '../constants/templates';
import { useCredits } from '../hooks/useCredits';
import GradientButton from '../components/GradientButton';
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
  initRevenueCat,
} from '../services/revenuecat';
import type { PurchasesPackage } from 'react-native-purchases';
import Constants from 'expo-constants';

const { width, height } = Dimensions.get('window');
const isExpoGo = Constants.appOwnership === 'expo';

export default function UpgradeScreen() {
  const router = useRouter();
  const { credits, upgrade } = useCredits();
  const [loading, setLoading] = useState(false);
  const [rcPackage, setRcPackage] = useState<PurchasesPackage | null>(null);
  const [offeringsLoading, setOfferingsLoading] = useState(true);
  const plan = SUBSCRIPTION_PLANS[0];

  useEffect(() => {
    if (isExpoGo) {
      setOfferingsLoading(false);
      return;
    }
    // Ensure RC is initialized, then load offerings with retry
    const loadOfferings = async () => {
      await initRevenueCat();
      for (let attempt = 0; attempt < 3; attempt++) {
        const offering = await getOfferings();
        if (offering?.availablePackages?.length) {
          setRcPackage(offering.availablePackages[0]);
          break;
        }
        // Wait before retrying
        if (attempt < 2) await new Promise((r) => setTimeout(r, 1500));
      }
      setOfferingsLoading(false);
    };
    loadOfferings();
  }, []);

  const handleSubscribe = async () => {
    if (isExpoGo) {
      Alert.alert(
        'Expo Go Not Supported',
        'In-app purchases require a real device build. Use TestFlight or build with: npx expo run:ios',
        [{ text: 'OK' }]
      );
      return;
    }
    if (!rcPackage) {
      Alert.alert(
        'Store Not Ready',
        'Could not load products from App Store. Please check your internet connection and try again.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Retry',
            onPress: async () => {
              const offering = await getOfferings();
              if (offering?.availablePackages?.length) {
                setRcPackage(offering.availablePackages[0]);
              }
            },
          },
        ]
      );
      return;
    }
    setLoading(true);
    try {
      const { isPro } = await purchasePackage(rcPackage);
      if (isPro) {
        await upgrade(plan.credits);
        Alert.alert(
          '🎉 Welcome to Diamond!',
          `You now have ${plan.credits.toLocaleString()} credits!`,
          [{ text: "Let's Go!", onPress: () => router.back() }]
        );
      }
    } catch (e: any) {
      if (e?.userCancelled) return;
      Alert.alert('Purchase Failed', 'Could not complete purchase. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    try {
      const { isPro } = await restorePurchases();
      if (isPro) {
        await upgrade(plan.credits);
        Alert.alert('Restored!', 'Your purchase has been restored.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('No Purchases Found', 'No active subscription was found to restore.');
      }
    } catch {
      Alert.alert('Restore Failed', 'Could not restore purchases. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#1A0A2E', '#0D0820', Colors.background]}
        style={StyleSheet.absoluteFill}
        locations={[0, 0.5, 1]}
      />

      {/* Background glow blobs */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />
      <View style={styles.blob3} />

      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Close button */}
        <View style={styles.header}>
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn} activeOpacity={0.8}>
            <Ionicons name="close" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero section */}
        <View style={styles.hero}>
          <LinearGradient
            colors={[Colors.purple, Colors.pink]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroIcon}
          >
            <Ionicons name="diamond" size={36} color="#fff" />
          </LinearGradient>

          <Text style={styles.heroTitle}>Upgrade Your Plan</Text>
          <Text style={styles.heroSubtitle}>Don't let your creativity stop</Text>

          {/* Current credits */}
          <View style={styles.currentCredits}>
            <Ionicons name="diamond" size={16} color={Colors.purple} />
            <Text style={styles.currentCreditsText}>
              Current balance: {credits.balance} credits
            </Text>
          </View>
        </View>

        {/* Plan Card */}
        <View style={styles.planCard}>
          <LinearGradient
            colors={[Colors.purple, Colors.pink]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.planCardBorder}
          >
            <View style={styles.planCardInner}>
              {/* Plan name badge */}
              <View style={styles.planBadge}>
                <LinearGradient
                  colors={[Colors.purple, Colors.pink]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.planBadgeGrad}
                >
                  <Ionicons name="diamond" size={12} color="#fff" />
                  <Text style={styles.planBadgeText}>{plan.name}</Text>
                </LinearGradient>
              </View>

              {/* Credits amount */}
              <Text style={styles.creditsAmount}>
                {plan.credits.toLocaleString()}
              </Text>
              <Text style={styles.creditsLabel}>credits</Text>

              {/* Price — use App Store localized price when available */}
              <View style={styles.priceRow}>
                <Text style={styles.price}>
                  {rcPackage?.product.priceString ?? plan.priceDisplay}
                </Text>
                <Text style={styles.pricePeriod}> / {plan.period}</Text>
              </View>

              {/* Features */}
              <View style={styles.features}>
                {plan.features.map((f) => (
                  <View key={f} style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Trial note */}
        {plan.trialDays && (
          <View style={styles.trialNote}>
            <Ionicons name="gift" size={16} color={Colors.warning} />
            <Text style={styles.trialText}>
              After your {plan.trialDays}-day free trial, you will be charged $7.99 per week unless canceled.
            </Text>
          </View>
        )}

        {/* Expo Go warning */}
        {isExpoGo && (
          <View style={styles.expoGoNote}>
            <Ionicons name="information-circle" size={16} color={Colors.warning} />
            <Text style={styles.expoGoText}>
              IAP only works in TestFlight / App Store builds
            </Text>
          </View>
        )}

        {/* CTA button */}
        <GradientButton
          title={
            offeringsLoading
              ? 'Loading...'
              : plan.trialDays
              ? `Start ${plan.trialDays}-Day Free Trial`
              : 'Subscribe Now'
          }
          onPress={handleSubscribe}
          loading={loading || offeringsLoading}
          colors={Colors.gradientUpgrade}
          style={styles.ctaBtn}
          leftIcon={<Ionicons name="diamond" size={18} color="#fff" />}
        />

        {/* Legal links */}
        <View style={styles.legalRow}>
          <TouchableOpacity onPress={() => Linking.openURL('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/')}>
            <Text style={styles.legalLink}>Terms of Use</Text>
          </TouchableOpacity>
          <Text style={styles.legalSep}>|</Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://mobilonn.com/privacy-policy.html')}>
            <Text style={styles.legalLink}>Privacy</Text>
          </TouchableOpacity>
          <Text style={styles.legalSep}>|</Text>
          <TouchableOpacity onPress={handleRestore}>
            <Text style={styles.legalLink}>Restore</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.disclaimer}>
          Subscription automatically renews unless cancelled at least 24 hours before the end of the
          current period. Payment will be charged to your account upon purchase confirmation.
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safe: {
    backgroundColor: 'transparent',
  },
  blob1: {
    position: 'absolute',
    top: 0,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.purple,
    opacity: 0.15,
  },
  blob2: {
    position: 'absolute',
    top: 100,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: Colors.pink,
    opacity: 0.1,
  },
  blob3: {
    position: 'absolute',
    bottom: 50,
    left: 50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.cyan,
    opacity: 0.06,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  content: {
    paddingHorizontal: 22,
    alignItems: 'center',
  },
  // Hero
  hero: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 10,
  },
  heroIcon: {
    width: 76,
    height: 76,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: Colors.purple,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  heroTitle: {
    color: Colors.textPrimary,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  heroSubtitle: {
    color: Colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
  },
  currentCredits: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(139,92,246,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.3)',
  },
  currentCreditsText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  // Plan card
  planCard: {
    width: '100%',
    marginBottom: 16,
    shadowColor: Colors.purple,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  planCardBorder: {
    padding: 2,
    borderRadius: 24,
  },
  planCardInner: {
    backgroundColor: Colors.card,
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  planBadge: {
    marginBottom: 8,
    borderRadius: 50,
    overflow: 'hidden',
  },
  planBadgeGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 50,
  },
  planBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  creditsAmount: {
    color: Colors.textPrimary,
    fontSize: 60,
    fontWeight: '900',
    letterSpacing: -2,
    lineHeight: 65,
  },
  creditsLabel: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    marginTop: -4,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  price: {
    color: Colors.textPrimary,
    fontSize: 26,
    fontWeight: '800',
  },
  pricePeriod: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  features: {
    width: '100%',
    gap: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    color: Colors.textSecondary,
    fontSize: 14,
    flex: 1,
  },
  // Trial
  trialNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 16,
    backgroundColor: 'rgba(245,158,11,0.1)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.25)',
  },
  trialText: {
    color: Colors.warning,
    fontSize: 13,
    fontWeight: '600',
  },
  expoGoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 12,
    backgroundColor: 'rgba(245,158,11,0.1)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.25)',
  },
  expoGoText: {
    color: Colors.warning,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  ctaBtn: {
    width: '100%',
    marginBottom: 20,
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  legalLink: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  legalSep: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  disclaimer: {
    color: Colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 8,
  },
});
