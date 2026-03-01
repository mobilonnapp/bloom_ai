import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Colors } from '../constants/colors';
import { getHistory } from '../services/storage';
import { VideoJob } from '../types';

const { width, height } = Dimensions.get('window');

export default function ResultScreen() {
  const { jobId, resultUrl } = useLocalSearchParams<{ jobId: string; resultUrl: string }>();
  const router = useRouter();

  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [saved, setSaved] = useState(false);

  const videoUri = resultUrl || '';

  // Stop video when screen unmounts (navigating away)
  useEffect(() => {
    return () => {
      videoRef.current?.setStatusAsync({ shouldPlay: false });
    };
  }, []);

  const stopAndNavigate = async (path: '/' | '/history') => {
    await videoRef.current?.setStatusAsync({ shouldPlay: false });
    router.push(path);
  };

  const handlePlaybackStatus = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsLoading(false);
      setIsPlaying(status.isPlaying);
    }
  };

  const togglePlay = async () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
  };

  const handleSave = async () => {
    if (!videoUri) {
      Alert.alert('Error', 'No video URL available.');
      return;
    }

    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to save videos to your gallery.');
      return;
    }

    setSaving(true);
    setSaveProgress(0);

    try {
      // Download to local file
      const localPath = FileSystem.documentDirectory + `bloom_${Date.now()}.mp4`;
      const downloadResult = await FileSystem.downloadAsync(videoUri, localPath, {});

      setSaveProgress(80);

      // Save to media library
      await MediaLibrary.saveToLibraryAsync(downloadResult.uri);

      setSaveProgress(100);
      setSaved(true);
      Alert.alert('Saved! 🎉', 'Your AI video has been saved to your gallery.', [
        { text: 'Great!' },
      ]);
    } catch (err) {
      Alert.alert('Error', 'Failed to save video. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    if (!videoUri) return;
    setSharing(true);

    try {
      // Download first if it's a remote URL
      let shareUri = videoUri;
      if (videoUri.startsWith('http')) {
        const localPath = FileSystem.cacheDirectory + `share_${Date.now()}.mp4`;
        const { uri } = await FileSystem.downloadAsync(videoUri, localPath);
        shareUri = uri;
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(shareUri, {
          mimeType: 'video/mp4',
          dialogTitle: 'Share your AI Video',
        });
      } else {
        Alert.alert('Sharing not available on this device.');
      }
    } catch {
      Alert.alert('Error', 'Failed to share. Please try again.');
    } finally {
      setSharing(false);
    }
  };

  return (
    <View style={styles.root}>
      {/* Video player */}
      <View style={styles.videoContainer}>
        {videoUri ? (
          <Video
            ref={videoRef}
            source={{ uri: videoUri }}
            style={styles.video}
            resizeMode={ResizeMode.COVER}
            shouldPlay
            isLooping
            onPlaybackStatusUpdate={handlePlaybackStatus}
          />
        ) : (
          <View style={styles.noVideo}>
            <Ionicons name="videocam-off" size={40} color={Colors.textMuted} />
            <Text style={styles.noVideoText}>Video not available</Text>
          </View>
        )}

        {/* Loading overlay */}
        {isLoading && videoUri && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.purple} />
            <Text style={styles.loadingText}>Loading video...</Text>
          </View>
        )}

        {/* Tap to play/pause overlay */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={togglePlay}
          activeOpacity={1}
        >
          {!isPlaying && !isLoading && (
            <View style={styles.playOverlay}>
              <View style={styles.playBtn}>
                <Ionicons name="play" size={36} color="#fff" />
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* Top bar */}
        <SafeAreaView style={styles.safeTop} edges={['top']}>
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => stopAndNavigate('/')}
              style={styles.homeBtn}
              activeOpacity={0.8}
            >
              <Ionicons name="home" size={20} color="#fff" />
            </TouchableOpacity>
            <View style={styles.topCenter}>
              <Ionicons name="sparkles" size={14} color={Colors.purpleLight} />
              <Text style={styles.topTitle}>Your AI Video</Text>
            </View>
            <TouchableOpacity
              onPress={() => stopAndNavigate('/history')}
              style={styles.homeBtn}
              activeOpacity={0.8}
            >
              <Ionicons name="time-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Bottom gradient */}
        <LinearGradient
          colors={['transparent', 'rgba(7,12,24,0.98)']}
          style={styles.bottomGrad}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <Text style={styles.readyText}>🎉 Your video is ready!</Text>
        <Text style={styles.readySub}>Share it with the world</Text>

        <View style={styles.btnRow}>
          {/* Save button */}
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.actionBtn, saved && styles.actionBtnDone]}
            disabled={saving || saved}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons
                name={saved ? 'checkmark-circle' : 'download-outline'}
                size={24}
                color={saved ? Colors.success : '#fff'}
              />
            )}
            <Text style={styles.actionBtnText}>{saved ? 'Saved' : 'Save'}</Text>
          </TouchableOpacity>

          {/* Share button */}
          <TouchableOpacity
            onPress={handleShare}
            style={[styles.actionBtn, styles.actionBtnShare]}
            disabled={sharing}
            activeOpacity={0.85}
          >
            {sharing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="share-social-outline" size={24} color="#fff" />
            )}
            <Text style={styles.actionBtnText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Create another */}
        <TouchableOpacity
          onPress={() => stopAndNavigate('/')}
          style={styles.createAnother}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle-outline" size={18} color={Colors.cyan} />
          <Text style={styles.createAnotherText}>Create Another Video</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  // Video
  videoContainer: {
    width,
    height: height * 0.62,
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  noVideo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: Colors.backgroundSecondary,
  },
  noVideoText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#fff',
    fontSize: 14,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Top bar overlay
  safeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  homeBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 50,
  },
  topTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  bottomGrad: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  // Actions
  actions: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: 'center',
    gap: 8,
  },
  readyText: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  readySub: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 10,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionBtnDone: {
    borderColor: Colors.success,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  actionBtnShare: {
    backgroundColor: 'rgba(0, 212, 255, 0.12)',
    borderColor: 'rgba(0, 212, 255, 0.35)',
  },
  actionBtnText: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  createAnother: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  createAnotherText: {
    color: Colors.cyan,
    fontSize: 14,
    fontWeight: '600',
  },
});
