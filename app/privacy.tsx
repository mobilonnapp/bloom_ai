import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const CYAN = '#00D4FF';
const PINK = '#EC4899';

interface SectionProps {
  number: string;
  title: string;
  children: React.ReactNode;
}

function PolicySection({ number, title, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionBadge}>
          <Text style={styles.sectionBadgeText}>{number}</Text>
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      {/* Background blobs */}
      <View style={styles.blobTopRight} />
      <View style={styles.blobBottomLeft} />

      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.75}>
            <Ionicons name="chevron-back" size={22} color={CYAN} />
          </TouchableOpacity>
          <Text style={styles.title}>Privacy Policy</Text>
          <View style={{ width: 38 }} />
        </View>

        {/* Scrollable policy card */}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <PolicySection number="1" title="Data Collection">
              <Text style={styles.bodyText}>
                When you use our app, we collect certain information to provide you with the best
                video creation experience. This may include:
              </Text>
              <View style={styles.bulletList}>
                <BulletItem text="Media files and images you upload." />
                <BulletItem text="Device information and operating system version." />
                <BulletItem text="Anonymized usage data to improve our AI models." />
              </View>
            </PolicySection>

            <View style={styles.sectionDivider} />

            <PolicySection number="2" title="Data Usage">
              <Text style={styles.bodyText}>
                The data we collect is used to optimize our AI processing pipelines and generate
                personalized content for you. Your personal data is never shared with third-party
                advertisers.
              </Text>
              <Text style={[styles.bodyText, { marginTop: 8 }]}>
                After video processing is complete, temporary data on our cloud servers is
                periodically purged.
              </Text>
            </PolicySection>

            <View style={styles.sectionDivider} />

            <PolicySection number="3" title="Security">
              <Text style={styles.bodyText}>
                The security of your data is our top priority. We use industry-standard encryption
                (AES-256) and maintain a continuously monitored infrastructure against cyber attacks
                and unauthorized access.
              </Text>
              <Text style={[styles.bodyText, { marginTop: 8 }]}>
                We recommend enabling two-factor authentication to keep your account secure.
              </Text>
            </PolicySection>

            <View style={styles.sectionDivider} />

            <PolicySection number="4" title="Your Rights">
              <Text style={styles.bodyText}>
                You have the right to request deletion of your data or to learn what data is being
                processed. Please contact us through our support center at any time.
              </Text>
            </PolicySection>
          </View>
        </ScrollView>

        {/* Bottom button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.understoodBtn}
            onPress={() => router.back()}
            activeOpacity={0.85}
          >
            <Text style={styles.understoodText}>GOT IT</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

function BulletItem({ text }: { text: string }) {
  return (
    <View style={styles.bulletItem}>
      <Text style={styles.bulletDot}>•</Text>
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

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
    opacity: 0.10,
  },
  blobBottomLeft: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: CYAN,
    opacity: 0.08,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(10,11,26,0.85)',
  },
  backBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: CYAN,
    fontSize: 19,
    fontWeight: '800',
    textShadowColor: 'rgba(0,212,255,0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  scrollArea: {
    flex: 1,
  },
  scroll: {
    padding: 16,
    paddingBottom: 8,
  },
  card: {
    backgroundColor: 'rgba(26,27,46,0.85)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(236,72,153,0.2)',
    padding: 20,
    shadowColor: PINK,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
    gap: 0,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionBadge: {
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.35)',
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  sectionBadgeText: {
    color: CYAN,
    fontSize: 11,
    fontWeight: '700',
  },
  sectionTitle: {
    color: CYAN,
    fontSize: 16,
    fontWeight: '700',
    textShadowColor: 'rgba(0,212,255,0.35)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  bodyText: {
    color: 'rgba(200,200,220,0.85)',
    fontSize: 13,
    lineHeight: 20,
  },
  bulletList: {
    gap: 6,
  },
  bulletItem: {
    flexDirection: 'row',
    gap: 8,
  },
  bulletDot: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    lineHeight: 20,
  },
  bulletText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(236,72,153,0.12)',
    marginVertical: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(10,11,26,0.95)',
  },
  understoodBtn: {
    backgroundColor: CYAN,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: CYAN,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  understoodText: {
    color: '#0A0B1A',
    fontSize: 16,
    fontWeight: '800',
  },
});
