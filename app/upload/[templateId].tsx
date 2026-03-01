import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../constants/colors';
import { getTemplateById } from '../../constants/templates';
import { FacePhoto } from '../../types';
import GradientButton from '../../components/GradientButton';
import PhotoUploadBox from '../../components/PhotoUploadBox';

const MIN_SIZE = 150; // px minimum face image size

export default function UploadScreen() {
  const { templateId } = useLocalSearchParams<{ templateId: string }>();
  const router = useRouter();
  const template = getTemplateById(templateId);

  const [photo1, setPhoto1] = useState<FacePhoto | null>(null);
  const [photo2, setPhoto2] = useState<FacePhoto | null>(null);
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [error1, setError1] = useState('');
  const [error2, setError2] = useState('');

  const pickPhoto = async (
    slot: 1 | 2,
    setLoading: (v: boolean) => void,
    setPhoto: (p: FacePhoto | null) => void,
    setError: (e: string) => void
  ) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission required',
        'Please allow access to your photos in Settings.',
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        // Validate size
        if (asset.width < MIN_SIZE || asset.height < MIN_SIZE) {
          setError(`Image too small. Min ${MIN_SIZE}×${MIN_SIZE}px.`);
          setLoading(false);
          return;
        }

        setPhoto({
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          mimeType: asset.mimeType,
        });
      }
    } catch {
      Alert.alert('Error', 'Could not pick image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePickPhoto1 = () =>
    pickPhoto(1, setLoading1, setPhoto1, setError1);

  const handlePickPhoto2 = () =>
    pickPhoto(2, setLoading2, setPhoto2, setError2);

  const handleCreate = () => {
    // Validate both photos present
    if (!photo1) {
      setError1('Please add a photo for Person 1.');
      return;
    }
    if (!photo2) {
      setError2('Please add a photo for Person 2.');
      return;
    }
    if (!template) return;

    router.push({
      pathname: '/processing',
      params: {
        templateId: template.id,
        templateTitle: template.title,
        templateThumbnail: template.thumbnailUrl,
        templateVideoUrl: template.videoUrl,
        face1Uri: photo1.uri,
        face2Uri: photo2.uri,
      },
    });
  };

  const canCreate = !!photo1 && !!photo2;

  return (
    <View style={styles.root}>
      {/* Subtle background glow */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />

      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
            <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/history')}
            style={styles.historyBtn}
            activeOpacity={0.8}
          >
            <Ionicons name="time-outline" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Title block */}
        <Text style={styles.title}>Upload Photos</Text>
        <Text style={styles.subtitle}>
          Use clear, well lit photos, where faces are{'\n'}
          easy to spot. Skip group or blurry ones!
        </Text>

        {/* Photo boxes */}
        <View style={styles.photosRow}>
          <PhotoUploadBox
            label="Person 1"
            photo={photo1}
            onPress={handlePickPhoto1}
            loading={loading1}
            error={error1}
          />
          <View style={styles.photoGap} />
          <PhotoUploadBox
            label="Person 2"
            photo={photo2}
            onPress={handlePickPhoto2}
            loading={loading2}
            error={error2}
          />
        </View>

        {/* Tips */}
        <View style={styles.tipsBox}>
          <Text style={styles.tipsTitle}>Photo Tips</Text>
          {[
            'Face should fill at least 50% of the frame',
            'Use good lighting — avoid shadows',
            'One face per photo only',
            'No sunglasses or masks',
          ].map((tip) => (
            <View key={tip} style={styles.tipRow}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* Privacy notice */}
        <View style={styles.privacyRow}>
          <Ionicons name="lock-closed" size={13} color={Colors.textMuted} />
          <Text style={styles.privacyText}>
            Photos will be immediately deleted from our server after the creations are ready.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <GradientButton
          title="Create Video"
          onPress={handleCreate}
          disabled={!canCreate}
          style={styles.ctaBtn}
          leftIcon={<Ionicons name="diamond" size={16} color={canCreate ? '#fff' : Colors.textMuted} />}
          rightIcon={<Ionicons name="sparkles" size={14} color={canCreate ? '#fff' : Colors.textMuted} />}
        />
      </View>
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
    top: 60,
    left: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: Colors.purple,
    opacity: 0.08,
  },
  blob2: {
    position: 'absolute',
    bottom: 180,
    right: -70,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.pink,
    opacity: 0.07,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 4,
    paddingBottom: 120,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 32,
  },
  photosRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 28,
  },
  photoGap: {
    width: 12,
  },
  tipsBox: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
    gap: 8,
  },
  tipsTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipText: {
    color: Colors.textSecondary,
    fontSize: 13,
    flex: 1,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: 4,
  },
  privacyText: {
    color: Colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 22,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    paddingTop: 12,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  ctaBtn: {
    width: '100%',
  },
});
