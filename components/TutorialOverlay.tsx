import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// ─── Page data ────────────────────────────────────────────────────────────────

const PAGES = [
  {
    icon: 'sparkles' as const,
    gradient: ['#8B5CF6', '#EC4899'] as [string, string],
    accent: '#8B5CF6',
    title: "Welcome to\nBloom!",
    desc: 'Put your face into template videos using the power of AI. Fun, easy, and magical.',
  },
  {
    icon: 'film' as const,
    gradient: ['#00D4FF', '#0055CC'] as [string, string],
    accent: '#00D4FF',
    title: 'Pick Your\nTemplate',
    desc: 'Dance clips, baby scenes, movie moments… Browse dozens of ready-made templates and find your favorite.',
  },
  {
    icon: 'camera' as const,
    gradient: ['#EC4899', '#8B5CF6'] as [string, string],
    accent: '#EC4899',
    title: 'Add Your\nPhoto',
    desc: 'Upload a clear selfie. Our AI will seamlessly place your face into the template.',
  },
  {
    icon: 'diamond' as const,
    gradient: ['#00D4FF', '#8B5CF6'] as [string, string],
    accent: '#00D4FF',
    title: "Let's\nGet Started!",
    desc: 'You start with 0 credits. Upgrade anytime to create more amazing AI videos.',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function TutorialOverlay({ onDone }: { onDone: () => void }) {
  const [page, setPage] = useState(0);
  const isLast = page === PAGES.length - 1;
  const current = PAGES[page];

  // Container fade-out (on done)
  const containerOpacity = useRef(new Animated.Value(1)).current;

  // Content slide animation
  const slideX = useRef(new Animated.Value(0)).current;

  // Icon animations — reset on each page
  const iconScale = useRef(new Animated.Value(0.5)).current;
  const iconFloat = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;

  // Glow pulse behind icon
  const glowPulse = useRef(new Animated.Value(0.6)).current;

  // ── Float icon continuously ──
  useEffect(() => {
    let loop: Animated.CompositeAnimation;
    const startFloat = () => {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(iconFloat, {
            toValue: -10,
            duration: 1800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(iconFloat, {
            toValue: 0,
            duration: 1800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
    };
    startFloat();
    return () => loop?.stop();
  }, []);

  // ── Glow pulse continuously ──
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 0.6,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // ── Icon spring-in on page change ──
  useEffect(() => {
    iconScale.setValue(0.4);
    textOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(iconScale, {
        toValue: 1,
        tension: 65,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 380,
        delay: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [page]);

  // ── Navigate to next page ──
  const goNext = () => {
    // Slide out to the left
    Animated.timing(slideX, {
      toValue: -width,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setPage((p) => p + 1);
      slideX.setValue(width * 0.6); // pre-position from right
      Animated.timing(slideX, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });
  };

  // ── Finish tutorial ──
  const finish = () => {
    Animated.timing(containerOpacity, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => onDone());
  };

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      {/* ── Background blobs ── */}
      <Animated.View
        style={[
          styles.blobTopRight,
          { backgroundColor: current.accent, opacity: glowPulse },
        ]}
      />
      <View style={styles.blobBottomLeft} />

      {/* ── Skip button ── */}
      {!isLast && (
        <TouchableOpacity style={styles.skipBtn} onPress={finish} activeOpacity={0.7}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* ── Sliding content ── */}
      <Animated.View
        style={[styles.content, { transform: [{ translateX: slideX }] }]}
      >
        {/* Icon circle */}
        <Animated.View
          style={[
            styles.iconWrapper,
            { transform: [{ scale: iconScale }, { translateY: iconFloat }] },
          ]}
        >
          {/* Outer glow ring */}
          <Animated.View
            style={[
              styles.iconGlow,
              { backgroundColor: current.accent, opacity: glowPulse },
            ]}
          />
          {/* Gradient circle */}
          <LinearGradient
            colors={current.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconCircle}
          >
            <Ionicons name={current.icon} size={56} color="#fff" />
          </LinearGradient>
        </Animated.View>

        {/* Text */}
        <Animated.View style={[styles.textBlock, { opacity: textOpacity }]}>
          <Text style={[styles.pageTitle, { textShadowColor: current.accent }]}>
            {current.title}
          </Text>
          <Text style={styles.pageDesc}>{current.desc}</Text>
        </Animated.View>
      </Animated.View>

      {/* ── Bottom area ── */}
      <View style={styles.bottom}>
        {/* Dots */}
        <View style={styles.dots}>
          {PAGES.map((p, i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                i === page && { width: 22, backgroundColor: current.accent },
              ]}
            />
          ))}
        </View>

        {/* CTA button */}
        <TouchableOpacity
          onPress={isLast ? finish : goNext}
          activeOpacity={0.85}
          style={styles.btnWrapper}
        >
          <LinearGradient
            colors={current.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btn}
          >
            <Text style={styles.btnText}>
              {isLast ? "Let's Go!" : 'Continue'}
            </Text>
            <Ionicons
              name={isLast ? 'rocket' : 'arrow-forward'}
              size={18}
              color="#fff"
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const ICON_SIZE = 160;
const GLOW_SIZE = ICON_SIZE + 50;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#070C18',
    zIndex: 9998,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Blobs
  blobTopRight: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
  },
  blobBottomLeft: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#00D4FF',
    opacity: 0.07,
  },

  // Skip
  skipBtn: {
    position: 'absolute',
    top: 56,
    right: 24,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  skipText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontWeight: '600',
  },

  // Sliding content
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 40,
    width: '100%',
  },

  // Icon
  iconWrapper: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlow: {
    position: 'absolute',
    width: GLOW_SIZE,
    height: GLOW_SIZE,
    borderRadius: GLOW_SIZE / 2,
  },
  iconCircle: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Text
  textBlock: {
    alignItems: 'center',
    gap: 14,
  },
  pageTitle: {
    color: '#fff',
    fontSize: 38,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.8,
    lineHeight: 46,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },
  pageDesc: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    fontWeight: '400',
  },

  // Bottom
  bottom: {
    position: 'absolute',
    bottom: 52,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 24,
    paddingHorizontal: 32,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  btnWrapper: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
  },
  btnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
