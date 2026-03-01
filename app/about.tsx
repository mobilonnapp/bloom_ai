import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const CYAN = '#00D4FF';
const PINK = '#EC4899';

/** Diamond shape via rotate + border trick */
function DiamondIcon() {
  return (
    <View style={styles.diamondOuter}>
      <LinearGradient
        colors={[PINK, CYAN]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.diamondGradient}
      >
        <View style={styles.diamondInner}>
          <Ionicons
            name="flash"
            size={36}
            color="#fff"
            style={{ transform: [{ rotate: '45deg' }] }}
          />
        </View>
      </LinearGradient>
    </View>
  );
}

export default function AboutScreen() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <View style={styles.blobTopRight} />
      <View style={styles.blobBottomLeft} />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.75}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Hakkımızda</Text>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Diamond logo */}
          <View style={styles.diamondWrapper}>
            <DiamondIcon />
          </View>

          {/* Mission card */}
          <LinearGradient
            colors={[PINK, CYAN]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardBorder}
          >
            <View style={styles.cardInner}>
              <Text style={styles.cardHeadline}>
                Geleceğin video teknolojilerini herkes için erişilebilir kılıyoruz...
              </Text>
              <Text style={styles.cardBody}>
                Yapay zeka gücüyle yaratıcılığınızı sınırlardan kurtarıyoruz. Cyberpunk
                vizyonumuzla, karmaşık düzenleme süreçlerini tek bir dokunuşa indirgiyoruz.
                {'\n\n'}
                Amacımız, her kullanıcının profesyonel kalitede içerikler üretebileceği, dijital
                sanatın ve teknolojinin mükemmel uyumunu yakaladığı bir platform sunmak. Bizimle
                birlikte video üretiminin geleceğini keşfedin.
              </Text>
            </View>
          </LinearGradient>

          {/* Contact button */}
          <LinearGradient
            colors={[PINK, CYAN]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.contactBtn}
          >
            <TouchableOpacity
              style={styles.contactBtnTouchable}
              activeOpacity={0.85}
              onPress={() => Linking.openURL('mailto:destek@bloomai.app').catch(() => {})}
            >
              <Text style={styles.contactBtnText}>BİZE ULAŞIN</Text>
            </TouchableOpacity>
          </LinearGradient>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const DIAMOND_SIZE = 100;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0B1A',
  },
  blobTopRight: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: PINK,
    opacity: 0.12,
  },
  blobBottomLeft: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: CYAN,
    opacity: 0.10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: CYAN,
    fontSize: 22,
    fontWeight: '800',
    textShadowColor: 'rgba(0,212,255,0.45)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 48,
    alignItems: 'center',
    gap: 24,
  },
  diamondWrapper: {
    marginTop: 24,
    alignItems: 'center',
    shadowColor: CYAN,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 28,
    elevation: 16,
  },
  /* rotate a square 45° to make a diamond */
  diamondOuter: {
    width: DIAMOND_SIZE,
    height: DIAMOND_SIZE,
    transform: [{ rotate: '45deg' }],
    borderRadius: 12,
    overflow: 'hidden',
  },
  diamondGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diamondInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBorder: {
    width: '100%',
    borderRadius: 24,
    padding: 2,
  },
  cardInner: {
    backgroundColor: 'rgba(22,27,51,0.94)',
    borderRadius: 22,
    padding: 20,
    gap: 12,
  },
  cardHeadline: {
    color: PINK,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
    textShadowColor: 'rgba(236,72,153,0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  cardBody: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    lineHeight: 22,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 24,
  },
  socialBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,212,255,0.06)',
  },
  contactBtn: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  contactBtnTouchable: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  contactBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 3,
  },
});
