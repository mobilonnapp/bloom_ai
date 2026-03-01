import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Dimensions,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

const BG    = '#0A0B1A';
const PINK  = '#FF2E97';
const CYAN  = '#00F0FF';

const RING_SIZE = 180;
const MASK_SIZE = 162;
const LOGO_SIZE = 108;

// ─── Single floating diamond particle ────────────────────────────────────────

interface ParticleProps { left: string; delay: number; size: number }

function DiamondParticle({ left, delay, size }: ParticleProps) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let mounted = true;
    const loop = () => {
      if (!mounted) return;
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: 3600,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished && mounted) loop();
      });
    };
    const t = setTimeout(loop, delay);
    return () => { mounted = false; clearTimeout(t); };
  }, []);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -(height + 80)],
  });
  const opacity = anim.interpolate({
    inputRange: [0, 0.08, 0.8, 1],
    outputRange: [0, 0.65, 0.65, 0],
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        { left, transform: [{ translateY }], opacity },
      ]}
    >
      <Ionicons name="diamond" size={size} color={CYAN} />
    </Animated.View>
  );
}

// ─── Main overlay ─────────────────────────────────────────────────────────────

const PARTICLES: ParticleProps[] = [
  { left: '8%',  delay: 0,    size: 10 },
  { left: '22%', delay: 700,  size: 13 },
  { left: '42%', delay: 1300, size: 9  },
  { left: '62%', delay: 300,  size: 12 },
  { left: '78%', delay: 1000, size: 10 },
  { left: '14%', delay: 1600, size: 13 },
];

export default function SplashOverlay({ onDone }: { onDone: () => void }) {
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const logoScale        = useRef(new Animated.Value(0.5)).current;
  const logoOpacity      = useRef(new Animated.Value(0)).current;
  const textOpacity      = useRef(new Animated.Value(0)).current;
  const spinAnim         = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Continuously spin the gradient ring
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Logo pop-in
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 70,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
    ]).start();

    // Text fade-in (slight delay)
    Animated.timing(textOpacity, {
      toValue: 1,
      duration: 600,
      delay: 350,
      useNativeDriver: true,
    }).start();

    // Fade out the whole overlay after 2.2s, then notify parent
    const t = setTimeout(() => {
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 500,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start(() => onDone());
    }, 2200);

    return () => clearTimeout(t);
  }, []);

  const spin = spinAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      {/* Background radial blobs */}
      <View style={styles.blobTopRight} />
      <View style={styles.blobBottomLeft} />

      {/* Floating diamond particles */}
      {PARTICLES.map((p, i) => (
        <DiamondParticle key={i} {...p} />
      ))}

      {/* Center content */}
      <View style={styles.center}>

        {/* ── Spinning ring + logo ── */}
        <View style={styles.ringWrapper}>
          {/* Soft glow halo */}
          <View style={styles.glow} />

          {/* Spinning gradient disc (visible only as the ring border) */}
          <Animated.View style={[styles.ringDisc, { transform: [{ rotate: spin }] }]}>
            <LinearGradient
              colors={[CYAN, PINK, CYAN]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>

          {/* Dark mask to create the ring cutout */}
          <View style={styles.ringMask} />

          {/* App icon in center */}
          <Animated.View
            style={[
              styles.logoCircle,
              { transform: [{ scale: logoScale }], opacity: logoOpacity },
            ]}
          >
            <LinearGradient
              colors={['#8B5CF6', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoGradient}
            >
              <Ionicons name="sparkles" size={44} color="#fff" />
            </LinearGradient>
          </Animated.View>
        </View>

        {/* App name + tagline */}
        <Animated.View style={[styles.textBlock, { opacity: textOpacity }]}>
          <Text style={styles.appName}>Bloom</Text>
          <Text style={styles.appSub}>AI VIDEO MAKER</Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BG,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Background blobs
  blobTopRight: {
    position: 'absolute',
    top: -70,
    right: -70,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: PINK,
    opacity: 0.13,
  },
  blobBottomLeft: {
    position: 'absolute',
    bottom: -70,
    left: -70,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: CYAN,
    opacity: 0.10,
  },

  // Particles
  particle: {
    position: 'absolute',
    bottom: -20,
  },

  // Ring + logo area
  center: {
    alignItems: 'center',
    gap: 40,
  },
  ringWrapper: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: RING_SIZE + 40,
    height: RING_SIZE + 40,
    borderRadius: (RING_SIZE + 40) / 2,
    backgroundColor: PINK,
    opacity: 0.14,
  },
  ringDisc: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    overflow: 'hidden',
  },
  ringMask: {
    position: 'absolute',
    width: MASK_SIZE,
    height: MASK_SIZE,
    borderRadius: MASK_SIZE / 2,
    backgroundColor: BG,
  },
  logoCircle: {
    position: 'absolute',
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    overflow: 'hidden',
  },
  logoGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Text
  textBlock: {
    alignItems: 'center',
    gap: 10,
  },
  appName: {
    color: '#fff',
    fontSize: 46,
    fontWeight: '800',
    letterSpacing: -1,
    textShadowColor: PINK,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  appSub: {
    color: CYAN,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 3,
    opacity: 0.85,
  },
});
