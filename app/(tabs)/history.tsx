import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { VideoJob } from '../../types';
import { getHistory, deleteVideoJob } from '../../services/storage';
import { Colors } from '../../constants/colors';
import { useCredits } from '../../hooks/useCredits';
import CreditBadge from '../../components/CreditBadge';
import NeonBorderBox from '../../components/NeonBorderBox';

function EmptyState() {
  return (
    <View style={styles.emptyWrapper}>
      {/* Bokeh blobs */}
      <View style={[styles.bokeh, { top: 40, left: 20, backgroundColor: Colors.purple }]} />
      <View style={[styles.bokeh, { top: 120, right: 30, backgroundColor: Colors.pink }]} />
      <View style={[styles.bokeh, { bottom: 80, left: 80, backgroundColor: Colors.cyan }]} />

      <NeonBorderBox style={styles.emptyBox} innerStyle={styles.emptyInner}>
        <Text style={styles.emptySparkle}>✦✦</Text>
        <Text style={styles.emptyTitle}>Şimdilik burası boş.</Text>
        <Text style={styles.emptySubtitle}>
          Geçmiş oluşturmaları burada{'\n'}göreceksiniz.
        </Text>
      </NeonBorderBox>
    </View>
  );
}

interface HistoryCardProps {
  job: VideoJob;
  onShare: (job: VideoJob) => void;
  onDelete: (job: VideoJob) => void;
  onPress: (job: VideoJob) => void;
}

function HistoryCard({ job, onShare, onDelete, onPress }: HistoryCardProps) {
  const isProcessing = job.status === 'processing' || job.status === 'pending';
  const isFailed = job.status === 'failed';

  const statusColor = isFailed
    ? Colors.error
    : isProcessing
    ? Colors.warning
    : Colors.success;

  return (
    <TouchableOpacity
      onPress={() => !isProcessing && !isFailed && onPress(job)}
      style={styles.card}
      activeOpacity={0.85}
    >
      {/* Thumbnail */}
      <View style={styles.thumb}>
        <Image
          source={{ uri: job.templateThumbnail }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        {isProcessing && (
          <View style={styles.processingOverlay}>
            <Ionicons name="time-outline" size={24} color={Colors.warning} />
          </View>
        )}
        {isFailed && (
          <View style={styles.processingOverlay}>
            <Ionicons name="close-circle" size={24} color={Colors.error} />
          </View>
        )}
        {job.status === 'completed' && (
          <View style={styles.playBadge}>
            <Ionicons name="play" size={12} color="#fff" />
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {job.templateTitle}
        </Text>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {job.status === 'completed'
              ? 'Ready'
              : job.status === 'processing'
              ? 'Processing...'
              : job.status === 'pending'
              ? 'Pending'
              : 'Failed'}
          </Text>
        </View>
        <Text style={styles.cardDate}>
          {new Date(job.createdAt).toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.cardActions}>
        {job.status === 'completed' && (
          <TouchableOpacity
            onPress={() => onShare(job)}
            style={styles.actionBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="share-social-outline" size={20} color={Colors.cyan} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => onDelete(job)}
          style={styles.actionBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={20} color={Colors.error} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function HistoryScreen() {
  const router = useRouter();
  const { credits } = useCredits();
  const [history, setHistory] = useState<VideoJob[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = useCallback(async () => {
    const data = await getHistory();
    setHistory(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const handleShare = async (job: VideoJob) => {
    if (!job.resultUrl && !job.localResultPath) return;
    try {
      const uri = job.localResultPath ?? job.resultUrl!;
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'video/mp4' });
      }
    } catch {
      Alert.alert('Error', 'Could not share this video.');
    }
  };

  const handleDelete = (job: VideoJob) => {
    Alert.alert('Delete Video', 'Remove this video from your history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteVideoJob(job.id);
          setHistory((prev) => prev.filter((j) => j.id !== job.id));
        },
      },
    ]);
  };

  const handlePress = (job: VideoJob) => {
    router.push({ pathname: '/result', params: { jobId: job.id, resultUrl: job.resultUrl } });
  };

  return (
    <View style={styles.root}>
      <View style={styles.blob} />

      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.titleRow}>
            <Text style={styles.headerTitle}>History</Text>
            {history.length > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{history.length}</Text>
              </View>
            )}
          </View>

          <View style={styles.headerRight}>
            <CreditBadge amount={credits.balance} size="sm" />
          </View>
        </View>
      </SafeAreaView>

      {/* List */}
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <HistoryCard
            job={item}
            onShare={handleShare}
            onDelete={handleDelete}
            onPress={handlePress}
          />
        )}
        ListEmptyComponent={<EmptyState />}
        contentContainerStyle={history.length === 0 ? styles.empty : styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.purple}
          />
        }
        showsVerticalScrollIndicator={false}
      />
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
  blob: {
    position: 'absolute',
    bottom: 100,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.purple,
    opacity: 0.07,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: Colors.card,
    marginRight: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
  countBadge: {
    backgroundColor: Colors.purple,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  countText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // Empty state
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  emptyWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  bokeh: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.12,
  },
  emptyBox: {
    width: '90%',
  },
  emptyInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptySparkle: {
    fontSize: 28,
    marginBottom: 14,
  },
  emptyTitle: {
    color: Colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  // History list
  listContent: {
    padding: 16,
    gap: 12,
  },
  // Card
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  thumb: {
    width: 80,
    height: 90,
    backgroundColor: Colors.backgroundSecondary,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    gap: 4,
  },
  cardTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardDate: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  cardActions: {
    justifyContent: 'center',
    paddingRight: 12,
    gap: 12,
  },
  actionBtn: {
    padding: 6,
  },
});
