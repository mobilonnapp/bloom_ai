import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getHistory } from '../services/storage';
import { useCredits } from '../hooks/useCredits';

const CYAN = '#00D4FF';
const PINK = '#EC4899';

// ─── Small reusable pieces ────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function Divider() {
  return <View style={styles.divider} />;
}

interface RowProps {
  label: string;
  badge?: string;
  rightText?: string;
  onPress?: () => void;
}

function SettingsRow({ label, badge, rightText, onPress }: RowProps) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowRight}>
        {badge !== undefined && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        {rightText && <Text style={styles.rowRightText}>{rightText}</Text>}
        <Ionicons name="chevron-forward" size={16} color={CYAN} />
      </View>
    </TouchableOpacity>
  );
}

function SettingsGroup({ children }: { children: React.ReactNode }) {
  return <View style={styles.group}>{children}</View>;
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const router = useRouter();
  const { credits } = useCredits();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [historyCount, setHistoryCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      getHistory().then((h) => setHistoryCount(h.length));
    }, [])
  );

  const isPro = credits.plan === 'pro';

  return (
    <View style={styles.root}>
      {/* Background blobs */}
      <View style={styles.blobTopRight} />
      <View style={styles.blobBottomLeft} />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.75}
          >
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* ── PRO Membership card ── */}
          <LinearGradient
            colors={[PINK, CYAN]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.proCardBorder}
          >
            <View style={styles.proCardInner}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.proTitle}>
                  {isPro ? 'PRO Membership' : 'Free Plan'}
                </Text>
                <Text style={styles.proSub}>
                  {isPro
                    ? `${credits.balance.toLocaleString()} credits remaining`
                    : 'Upgrade to unlock unlimited videos'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/upgrade')}
                style={styles.manageBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.manageBtnText}>
                  {isPro ? 'MANAGE' : 'UPGRADE'}
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* ── Account ── */}
          <SectionHeader title="Account" />
          <SettingsGroup>
            <SettingsRow
              label="History Videos"
              badge={String(historyCount)}
              onPress={() => router.push('/(tabs)/history')}
            />
            <Divider />
            <SettingsRow
              label="Destek Merkezi"
              onPress={() =>
                Alert.alert(
                  'Destek Merkezi',
                  'Destek için destek@bloomai.app adresine yazabilirsiniz.',
                  [{ text: 'Tamam' }]
                )
              }
            />
          </SettingsGroup>

          {/* ── Preferences ── */}
          <SectionHeader title="Preferences" />
          <SettingsGroup>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Push Notifications</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{
                  false: 'rgba(0,212,255,0.15)',
                  true: 'rgba(0,212,255,0.45)',
                }}
                thumbColor={notificationsEnabled ? CYAN : '#888'}
                ios_backgroundColor="rgba(0,212,255,0.15)"
              />
            </View>
            <Divider />
            <SettingsRow
              label="AI Processing Mode"
              rightText="Standard"
              onPress={() => {}}
            />
          </SettingsGroup>

          {/* ── Support ── */}
          <SectionHeader title="Support" />
          <SettingsGroup>
            <SettingsRow
              label="Hakkımızda"
              onPress={() => router.push('/about')}
            />
            <Divider />
            <SettingsRow
              label="Privacy Policy"
              onPress={() => router.push('/privacy')}
            />
            <Divider />
            <SettingsRow
              label="Terms of Service"
              onPress={() => router.push('/terms')}
            />
          </SettingsGroup>

          {/* ── Footer ── */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={() =>
                Alert.alert('Çıkış Yap', 'Çıkış yapmak istediğinizden emin misiniz?', [
                  { text: 'İptal', style: 'cancel' },
                  {
                    text: 'Çıkış Yap',
                    style: 'destructive',
                    onPress: () => router.replace('/(tabs)' as never),
                  },
                ])
              }
              activeOpacity={0.75}
            >
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
            <Text style={styles.version}>VERSION 1.0.0</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
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

  // Top bar
  topBar: {
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
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0,212,255,0.45)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },

  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 48,
    gap: 8,
  },

  // PRO card
  proCardBorder: {
    borderRadius: 18,
    padding: 2,
    marginBottom: 8,
  },
  proCardInner: {
    backgroundColor: '#161B33',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  proTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  proSub: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
  },
  manageBtn: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  manageBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Section header
  sectionHeader: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 12,
    marginBottom: 4,
    marginLeft: 4,
  },

  // Group & rows
  group: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  rowLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowRightText: {
    color: CYAN,
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(236,72,153,0.2)',
    marginHorizontal: 16,
  },

  // Badge
  badge: {
    backgroundColor: 'rgba(0,212,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.3)',
    borderRadius: 50,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: CYAN,
    fontSize: 11,
    fontWeight: '700',
  },

  // Footer
  footer: {
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  },
  logoutText: {
    color: '#F87171',
    fontSize: 15,
    fontWeight: '600',
    textShadowColor: 'rgba(239,68,68,0.35)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  version: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2,
  },
});
