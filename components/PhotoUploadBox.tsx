import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/colors';
import { FacePhoto } from '../types';

interface PhotoUploadBoxProps {
  label: string;
  photo: FacePhoto | null;
  onPress: () => void;
  loading?: boolean;
  error?: string;
}

export default function PhotoUploadBox({
  label,
  photo,
  onPress,
  loading = false,
  error,
}: PhotoUploadBoxProps) {
  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const hasError = !!error;
  const borderColors: readonly [string, string] = hasError
    ? [Colors.error, Colors.warning]
    : Colors.gradientBorderPurplePink;

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={borderColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <TouchableOpacity
          onPress={handlePress}
          style={styles.inner}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.purple} size="large" />
          ) : photo ? (
            <>
              <Image source={{ uri: photo.uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
              {/* Edit overlay */}
              <View style={styles.editOverlay}>
                <Ionicons name="pencil" size={22} color="#fff" />
              </View>
            </>
          ) : (
            <View style={styles.emptyContent}>
              <View style={styles.plusCircle}>
                <Ionicons name="add" size={36} color={Colors.textSecondary} />
              </View>
            </View>
          )}

          {/* Bottom-right hint icons */}
          {!photo && !loading && (
            <View style={styles.hintIcons}>
              <MaterialCommunityIcons
                name="face-recognition"
                size={16}
                color={Colors.textMuted}
                style={styles.hintIcon}
              />
              <MaterialCommunityIcons
                name="qrcode-scan"
                size={16}
                color={Colors.textMuted}
              />
            </View>
          )}
        </TouchableOpacity>
      </LinearGradient>

      <Text style={[styles.label, hasError && styles.labelError]}>{label}</Text>
      {hasError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    flex: 1,
  },
  gradient: {
    padding: 2,
    borderRadius: 20,
    width: '100%',
    aspectRatio: 1,
    shadowColor: Colors.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 10,
  },
  inner: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    aspectRatio: 1,
  },
  emptyContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: Colors.textMuted,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintIcons: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 8,
    padding: 4,
  },
  hintIcon: {
    marginRight: 2,
  },
  label: {
    marginTop: 10,
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  labelError: {
    color: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
});
