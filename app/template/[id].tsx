import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Video, ResizeMode } from 'expo-av';
import { Colors } from '../../constants/colors';
import { getTemplateById } from '../../constants/templates';
import GradientButton from '../../components/GradientButton';
import CreditBadge from '../../components/CreditBadge';
import { useCredits } from '../../hooks/useCredits';

const { width, height } = Dimensions.get('window');

export default function TemplateDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { credits } = useCredits();
  const template = getTemplateById(id);

  const videoRef = useRef<Video>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedCharIdx, setSelectedCharIdx] = useState(0);
  // Mount video only while this screen is focused — ensures a clean native view lifecycle
  const [isScreenFocused, setIsScreenFocused] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setIsScreenFocused(true);
      return () => setIsScreenFocused(false);
    }, [])
  );

  if (!template) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Template not found.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: Colors.cyan }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const canAfford = credits.balance >= template.credits;
  const chars = template.characters ?? [];
  const hasLocalVideo = !!template.localVideo;
  const hasRemoteVideo = !!template.videoUrl;
  const hasAnyVideo = hasLocalVideo || hasRemoteVideo;
  const videoSource = hasLocalVideo
    ? template.localVideo!
    : { uri: template.videoUrl };

  const handleCreate = () => {
    router.push(`/upload/${template.id}`);
  };

  const toggleMute = async () => {
    setIsMuted((m) => !m);
    await videoRef.current?.setStatusAsync({ isMuted: !isMuted });
  };

  return (
    <View style={styles.root}>
      {/* ── Full-screen background: video or image ── */}
      {hasAnyVideo && isScreenFocused ? (
        <Video
          ref={videoRef}
          source={videoSource as any}
          style={styles.bg}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping
          isMuted={isMuted}
        />
      ) : (
        <Image
          source={{ uri: template.thumbnailUrl }}
          style={styles.bg}
          resizeMode="cover"
        />
      )}

      {/* Dark overlay gradient */}
      <LinearGradient
        colors={['rgba(7,12,24,0.15)', 'rgba(7,12,24,0.0)', 'rgba(7,12,24,0.94)']}
        style={StyleSheet.absoluteFill}
        locations={[0, 0.35, 1]}
      />

      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.8}
          >
            <BlurView intensity={40} tint="dark" style={styles.blurBtn}>
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </BlurView>
          </TouchableOpacity>

          <Text style={styles.topTitle} numberOfLines={1}>
            {template.title}
          </Text>

          <View style={styles.topRight}>
            {/* Mute button — shown for any video */}
            {hasAnyVideo && (
              <TouchableOpacity
                onPress={toggleMute}
                style={styles.muteBtn}
                activeOpacity={0.8}
              >
                <BlurView intensity={40} tint="dark" style={styles.blurBtn}>
                  <Ionicons
                    name={isMuted ? 'volume-mute' : 'volume-high'}
                    size={18}
                    color="#fff"
                  />
                </BlurView>
              </TouchableOpacity>
            )}
            <CreditBadge amount={template.credits} size="sm" />
          </View>
        </View>
      </SafeAreaView>

      {/* Bottom panel */}
      <View style={styles.bottomPanel}>
        {/* Characters */}
        {chars.length > 0 && (
          <View style={styles.charsRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {chars.map((char, idx) => (
                <TouchableOpacity
                  key={char.id}
                  onPress={() => setSelectedCharIdx(idx)}
                  style={styles.charWrap}
                  activeOpacity={0.85}
                >
                  <Image source={{ uri: char.thumbnailUrl }} style={styles.charAvatar} />
                  {idx === selectedCharIdx && <View style={styles.charActiveRing} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="video" size={14} color={Colors.textSecondary} />
            <Text style={styles.statText}>1 video</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Ionicons
              name={template.hasSound ? 'volume-high' : 'volume-mute'}
              size={14}
              color={Colors.textSecondary}
            />
            <Text style={styles.statText}>
              {template.hasSound ? 'With sound' : 'No sound'}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Ionicons name="diamond" size={14} color={Colors.purple} />
            <Text style={styles.statText}>{template.credits} credits</Text>
          </View>
        </View>

        {/* CDN not set warning (dev only) */}
        {!hasRemoteVideo && (
          <View style={styles.cdnWarning}>
            <Ionicons name="cloud-upload-outline" size={14} color={Colors.cyan} />
            <Text style={styles.cdnWarningText}>
              Upload video to CDN and set{' '}
              <Text style={{ fontWeight: '700' }}>videoUrl</Text> in templates.ts for API
            </Text>
          </View>
        )}

        {/* Not enough credits */}
        {!canAfford && (
          <TouchableOpacity
            onPress={() => router.push('/upgrade')}
            style={styles.creditWarning}
            activeOpacity={0.85}
          >
            <Ionicons name="warning" size={14} color={Colors.warning} />
            <Text style={styles.creditWarningText}>
              Yetersiz kredi.{' '}
              <Text style={{ color: Colors.cyan, fontWeight: '700' }}>Yükselt →</Text>
            </Text>
          </TouchableOpacity>
        )}

        {/* Duration & tags */}
        {(template.duration > 0 || (template.tags?.length ?? 0) > 0) && (
          <View style={styles.durationRow}>
            {template.duration > 0 && (
              <>
                <Ionicons name="time-outline" size={13} color={Colors.textMuted} />
                <Text style={styles.durationText}>{template.duration}s</Text>
              </>
            )}
            {template.tags?.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* CTA */}
        <GradientButton
          title="Create Video"
          onPress={handleCreate}
          disabled={!canAfford}
          style={styles.ctaBtn}
          leftIcon={<Ionicons name="diamond" size={16} color="#fff" />}
          rightIcon={<Ionicons name="sparkles" size={16} color="#fff" />}
        />

        <View style={{ height: Platform.OS === 'ios' ? 0 : 16 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  bg: { ...StyleSheet.absoluteFillObject, width, height },
  safe: { zIndex: 10 },
  notFound: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  notFoundText: { color: Colors.textSecondary, fontSize: 16 },
  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  backBtn: { borderRadius: 12, overflow: 'hidden' },
  muteBtn: { borderRadius: 12, overflow: 'hidden' },
  blurBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  topTitle: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  // Bottom panel
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
    gap: 12,
  },
  charsRow: { marginBottom: 4 },
  charWrap: { marginRight: 10, position: 'relative' },
  charAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  charActiveRing: {
    position: 'absolute',
    top: -3, left: -3, right: -3, bottom: -3,
    borderRadius: 30,
    borderWidth: 2.5,
    borderColor: Colors.cyan,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13,21,38,0.75)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  statText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
  divider: { width: 1, height: 16, backgroundColor: Colors.border },
  cdnWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,212,255,0.08)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.2)',
  },
  cdnWarningText: { color: Colors.cyan, fontSize: 12, flex: 1, lineHeight: 17 },
  creditWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
  },
  creditWarningText: { color: Colors.warning, fontSize: 13, flex: 1 },
  durationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  durationText: { color: Colors.textMuted, fontSize: 12 },
  tag: {
    backgroundColor: 'rgba(139,92,246,0.18)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagText: { color: Colors.purpleLight, fontSize: 11, fontWeight: '600' },
  ctaBtn: { width: '100%' },
});
