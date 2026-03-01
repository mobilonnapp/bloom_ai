import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
  View,
  Dimensions,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Template } from '../types';
import { Colors } from '../constants/colors';

const CARD_WIDTH = (Dimensions.get('window').width - 52) / 2.4;

interface TemplateCardProps {
  template: Template;
  onPress: (template: Template) => void;
  width?: number;
  shouldPlay?: boolean;
}

export default function TemplateCard({
  template,
  onPress,
  width = CARD_WIDTH,
  shouldPlay = true,
}: TemplateCardProps) {
  const height = width * 1.5;
  const [videoError, setVideoError] = useState(false);
  const [imgError, setImgError] = useState(false);
  // Delay video mount so FlatList/native view registry is ready before expo-av registers EXVideo
  const [videoReady, setVideoReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVideoReady(true), 300);
    return () => clearTimeout(t);
  }, []);

  const videoSource = template.localVideo
    ? template.localVideo
    : template.videoUrl
    ? { uri: template.videoUrl }
    : null;
  const showVideo = !!videoSource && !videoError;

  return (
    <TouchableOpacity
      onPress={() => onPress(template)}
      style={[styles.container, { width, height }]}
      activeOpacity={0.88}
    >
      {/* Base thumbnail */}
      {imgError ? (
        <View style={[StyleSheet.absoluteFill, styles.placeholder]}>
          <Ionicons name="film-outline" size={32} color={Colors.textMuted} />
        </View>
      ) : (
        <Image
          source={{ uri: template.thumbnailUrl }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          onError={() => setImgError(true)}
        />
      )}

      {/* Video overlay — delayed mount so native EXVideo view is registered before playback */}
      {showVideo && shouldPlay && videoReady && (
        <Video
          source={videoSource as any}
          style={StyleSheet.absoluteFill}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping
          isMuted
          onError={() => setVideoError(true)}
        />
      )}

      {/* Gradient overlay at bottom */}
      <LinearGradient
        colors={['transparent', 'rgba(7,12,24,0.95)']}
        style={[StyleSheet.absoluteFill, styles.gradient]}
        start={{ x: 0, y: 0.45 }}
        end={{ x: 0, y: 1 }}
      />

      {/* Sound badge */}
      {template.hasSound && (
        <View style={styles.soundBadge}>
          <Ionicons name="musical-notes" size={10} color="#fff" />
        </View>
      )}

      {/* Popular / Trending badge */}
      {(template.isPopular || template.isTrending) && (
        <View style={styles.hotBadge}>
          <Text style={styles.hotText}>
            {template.isTrending ? '🔥' : '⭐'}
          </Text>
        </View>
      )}

      {/* Bottom info */}
      <View style={styles.infoRow}>
        <Text style={styles.title} numberOfLines={2}>
          {template.title}
        </Text>
        <View style={styles.creditRow}>
          <Ionicons name="diamond" size={10} color={Colors.purple} />
          <Text style={styles.creditText}>{template.credits}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.card,
    marginRight: 12,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
  },
  gradient: {
    borderRadius: 16,
  },
  soundBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 12,
    padding: 4,
  },
  hotBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  hotText: {
    fontSize: 16,
  },
  infoRow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
    lineHeight: 16,
  },
  creditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  creditText: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '500',
  },
});
