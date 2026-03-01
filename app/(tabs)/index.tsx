import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Template } from '../../types';
import { Colors } from '../../constants/colors';
import { MOCK_TEMPLATES, TEMPLATE_CATEGORIES } from '../../constants/templates';
import CategorySection from '../../components/CategorySection';
import CreditBadge from '../../components/CreditBadge';
import { useCredits } from '../../hooks/useCredits';

export default function HomeScreen() {
  const router = useRouter();
  const { credits } = useCredits();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isScreenFocused, setIsScreenFocused] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setIsScreenFocused(true);
      return () => setIsScreenFocused(false);
    }, [])
  );

  const handleTemplatePress = (template: Template) => {
    router.push(`/template/${template.id}`);
  };

  const templatesByCategory = TEMPLATE_CATEGORIES.reduce<Record<string, Template[]>>(
    (acc, cat) => {
      acc[cat] = MOCK_TEMPLATES.filter((t) => t.category === cat);
      return acc;
    },
    {}
  );

  return (
    <View style={styles.root}>
      {/* Background glow blobs */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />

      <SafeAreaView style={styles.safe}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <LinearGradient
              colors={[Colors.purple, Colors.pink]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoIcon}
            >
              <Ionicons name="sparkles" size={18} color="#fff" />
            </LinearGradient>
            <Text style={styles.logoText}>AI Maker</Text>
          </View>

          <View style={styles.headerRight}>
            <CreditBadge amount={credits.balance} size="sm" onPress={() => router.push('/upgrade')} />
            <TouchableOpacity
              onPress={() => router.push('/upgrade')}
              style={styles.headerBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="settings-outline" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Category Filter Pills ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pills}
          style={styles.pillsRow}
        >
          <TouchableOpacity
            onPress={() => setActiveCategory(null)}
            style={[styles.pill, !activeCategory && styles.pillActive]}
            activeOpacity={0.8}
          >
            <Text style={[styles.pillText, !activeCategory && styles.pillTextActive]}>All</Text>
          </TouchableOpacity>
          {TEMPLATE_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(activeCategory === cat ? null : cat)}
              style={[styles.pill, activeCategory === cat && styles.pillActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.pillText, activeCategory === cat && styles.pillTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>

      {/* ── Template Sections ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {TEMPLATE_CATEGORIES.filter((cat) => !activeCategory || cat === activeCategory).map(
          (cat) => (
            <CategorySection
              key={cat}
              title={cat}
              templates={templatesByCategory[cat] ?? []}
              onTemplatePress={handleTemplatePress}
              shouldPlayVideos={isScreenFocused}
            />
          )
        )}

        {/* Bottom padding for tab bar */}
        <View style={{ height: 20 }} />
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
  // Background glow blobs
  blob1: {
    position: 'absolute',
    top: -80,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: Colors.purple,
    opacity: 0.08,
  },
  blob2: {
    position: 'absolute',
    top: 200,
    right: -100,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: Colors.pink,
    opacity: 0.06,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerBtn: {
    padding: 4,
  },
  // Pills
  pillsRow: {
    marginTop: 4,
  },
  pills: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 50,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.25)',
    borderColor: Colors.purple,
  },
  pillText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  pillTextActive: {
    color: Colors.purpleLight,
  },
  // Content
  content: {
    paddingTop: 10,
  },
});
