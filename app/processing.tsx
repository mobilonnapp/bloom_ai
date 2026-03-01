import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useVideoGeneration } from '../hooks/useVideoGeneration';
import { useCredits } from '../hooks/useCredits';
import { getTemplateById } from '../constants/templates';
import { isApiKeyConfigured } from '../services/vmodel';

const { width } = Dimensions.get('window');

function PulsingRing({ delay, size, color }: { delay: number; size: number; color: string }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [anim, delay]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1.5,
        borderColor: color,
        opacity: anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.7, 0.2, 0] }),
        transform: [
          {
            scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] }),
          },
        ],
      }}
    />
  );
}

function AIOrb({ progress }: { progress: number }) {
  const spin = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 3000, useNativeDriver: true })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, [spin, pulse]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.orbContainer}>
      {/* Rings */}
      <PulsingRing delay={0} size={160} color={Colors.purple} />
      <PulsingRing delay={600} size={200} color={Colors.pink} />
      <PulsingRing delay={1200} size={240} color={Colors.cyan} />

      {/* Spinning gradient ring */}
      <Animated.View style={[styles.spinRing, { transform: [{ rotate }] }]}>
        <LinearGradient
          colors={[Colors.purple, Colors.pink, Colors.cyan, Colors.purple]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.spinRingGrad}
        />
      </Animated.View>

      {/* Core orb */}
      <Animated.View style={[styles.orb, { transform: [{ scale: pulse }] }]}>
        <LinearGradient
          colors={[Colors.purple, Colors.pink]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.orbGrad}
        >
          <Ionicons name="sparkles" size={32} color="#fff" />
          <Text style={styles.orbPercent}>{progress}%</Text>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

export default function ProcessingScreen() {
  const params = useLocalSearchParams<{
    templateId: string;
    templateTitle: string;
    templateThumbnail: string;
    templateVideoUrl: string;
    face1Uri: string;
    face2Uri: string;
  }>();
  const router = useRouter();
  const { spend } = useCredits();
  const template = getTemplateById(params.templateId);

  const { state, progress, statusMessage, currentJob, generate, cancel } = useVideoGeneration({
    onComplete: (job) => {
      router.replace({
        pathname: '/result',
        params: { jobId: job.id, resultUrl: job.resultUrl ?? '' },
      });
    },
    onError: (msg) => {
      Alert.alert('Generation Failed', msg, [
        { text: 'Retry', onPress: startGeneration },
        { text: 'Go Back', style: 'cancel', onPress: () => router.back() },
      ]);
    },
  });

  const startGeneration = async () => {
    if (!template) return;

    // Guard: API key not set
    if (!isApiKeyConfigured()) {
      Alert.alert(
        'API Key Missing',
        'Add your EXPO_PUBLIC_VMODEL_API_KEY to the .env file and restart the app.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
      return;
    }

    // Guard: template video not uploaded to CDN yet
    if (!params.templateVideoUrl) {
      Alert.alert(
        'Video Not Available',
        'This template video has not been uploaded to a CDN yet. Set videoUrl in constants/templates.ts.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
      return;
    }

    await spend(template.credits);

    generate({
      templateId: params.templateId,
      templateTitle: params.templateTitle,
      templateThumbnail: params.templateThumbnail,
      templateVideoUrl: params.templateVideoUrl,
      face1Uri: decodeURIComponent(params.face1Uri),
      face2Uri: decodeURIComponent(params.face2Uri),
    });
  };

  useEffect(() => {
    startGeneration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancel = () => {
    Alert.alert('Cancel Generation', 'Are you sure you want to cancel?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: () => {
          cancel();
          router.back();
        },
      },
    ]);
  };

  const steps = [
    { label: 'Uploading photos', done: progress >= 10 },
    { label: 'Processing face swap', done: progress >= 40 },
    { label: 'Rendering video', done: progress >= 70 },
    { label: 'Finalizing', done: progress >= 95 },
  ];

  return (
    <View style={styles.root}>
      {/* Background */}
      <LinearGradient
        colors={[Colors.background, '#0D0820', Colors.background]}
        style={StyleSheet.absoluteFill}
        locations={[0, 0.5, 1]}
      />
      <View style={styles.bgBlob1} />
      <View style={styles.bgBlob2} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>AI Processing</Text>
          <Text style={styles.headerSub}>{params.templateTitle}</Text>
        </View>

        {/* Orb */}
        <View style={styles.orbSection}>
          <AIOrb progress={progress} />
        </View>

        {/* Status text — fixed height prevents layout shift */}
        <View style={styles.statusWrap}>
          <Text style={styles.statusMsg}>{statusMessage || 'Initializing...'}</Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBarWrap}>
          <View style={styles.progressBg}>
            <LinearGradient
              colors={[Colors.purple, Colors.pink, Colors.cyan]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${progress}%` }]}
            />
          </View>
          <Text style={styles.progressLabel}>{progress}%</Text>
        </View>

        {/* Steps */}
        <View style={styles.stepsList}>
          {steps.map((step, idx) => (
            <View key={idx} style={styles.stepRow}>
              <View style={[styles.stepDot, step.done && styles.stepDotDone]}>
                {step.done ? (
                  <Ionicons name="checkmark" size={12} color="#fff" />
                ) : (
                  <View style={styles.stepDotInner} />
                )}
              </View>
              <Text style={[styles.stepText, step.done && styles.stepTextDone]}>
                {step.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Est. time */}
        <Text style={styles.etaText}>⏱ Estimated 30–90 seconds</Text>

        {/* Cancel */}
        <TouchableOpacity onPress={handleCancel} style={styles.cancelBtn} activeOpacity={0.7}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safe: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  bgBlob1: {
    position: 'absolute',
    top: 80,
    left: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: Colors.purple,
    opacity: 0.1,
  },
  bgBlob2: {
    position: 'absolute',
    bottom: 120,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: Colors.pink,
    opacity: 0.08,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statusWrap: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 4,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSub: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  // Orb
  orbSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  orbContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: 'hidden',
  },
  spinRingGrad: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  orb: {
    width: 110,
    height: 110,
    borderRadius: 55,
    overflow: 'hidden',
  },
  orbGrad: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  orbPercent: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  // Status
  statusMsg: {
    color: Colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
  },
  // Progress bar
  progressBarWrap: {
    width: '100%',
    marginBottom: 24,
    gap: 6,
  },
  progressBg: {
    height: 6,
    backgroundColor: Colors.card,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: 'right',
  },
  // Steps
  stepsList: {
    width: '100%',
    gap: 10,
    marginBottom: 20,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotDone: {
    backgroundColor: Colors.purple,
    borderColor: Colors.purple,
  },
  stepDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.textMuted,
  },
  stepText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '600',     // always bold — prevents layout shift when toggling done
    flex: 1,
  },
  stepTextDone: {
    color: Colors.textPrimary,
  },
  etaText: {
    color: Colors.textMuted,
    fontSize: 12,
    marginBottom: 28,
  },
  cancelBtn: {
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
