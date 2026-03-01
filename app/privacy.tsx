import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const CYAN = '#00D4FF';
const PINK = '#EC4899';

interface SectionProps {
  number: string;
  title: string;
  children: React.ReactNode;
}

function PolicySection({ number, title, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionBadge}>
          <Text style={styles.sectionBadgeText}>{number}</Text>
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      {/* Background blobs */}
      <View style={styles.blobTopRight} />
      <View style={styles.blobBottomLeft} />

      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.75}>
            <Ionicons name="chevron-back" size={22} color={CYAN} />
          </TouchableOpacity>
          <Text style={styles.title}>Gizlilik Politikası</Text>
          <View style={{ width: 38 }} />
        </View>

        {/* Scrollable policy card */}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <PolicySection number="1" title="Veri Toplama">
              <Text style={styles.bodyText}>
                Uygulamamızı kullandığınızda, size en iyi video oluşturma deneyimini sunmak için belirli
                bilgileri topluyoruz. Bu bilgiler şunları içerebilir:
              </Text>
              <View style={styles.bulletList}>
                <BulletItem text="Yüklediğiniz medya dosyaları ve görseller." />
                <BulletItem text="Cihaz bilgileri ve işletim sistemi sürümü." />
                <BulletItem text="AI modellerini iyileştirmek için anonimleştirilmiş kullanım verileri." />
              </View>
            </PolicySection>

            <View style={styles.sectionDivider} />

            <PolicySection number="2" title="Veri Kullanımı">
              <Text style={styles.bodyText}>
                Topladığımız veriler, yapay zeka işlem süreçlerimizi optimize etmek ve size özel içerikler
                üretmek amacıyla kullanılır. Kişisel verileriniz asla üçüncü taraf reklam verenlerle
                paylaşılmaz.
              </Text>
              <Text style={[styles.bodyText, { marginTop: 8 }]}>
                Video işleme süreçleri tamamlandıktan sonra, bulut sunucularımızdaki geçici veriler
                periyodik olarak temizlenir.
              </Text>
            </PolicySection>

            <View style={styles.sectionDivider} />

            <PolicySection number="3" title="Güvenlik">
              <Text style={styles.bodyText}>
                Verilerinizin güvenliği bizim için en öncelikli konudur. Endüstri standardı şifreleme
                yöntemlerini (AES-256) kullanıyoruz. Siber saldırılara ve yetkisiz erişimlere karşı
                sürekli izlenen bir altyapı sunuyoruz.
              </Text>
              <Text style={[styles.bodyText, { marginTop: 8 }]}>
                Hesabınızın güvenliği için iki aşamalı doğrulamayı aktif etmenizi öneririz.
              </Text>
            </PolicySection>

            <View style={styles.sectionDivider} />

            <PolicySection number="4" title="Haklarınız">
              <Text style={styles.bodyText}>
                KVKK kapsamında, verilerinizin silinmesini talep etme veya hangi verilerin işlendiğini
                öğrenme hakkına sahipsiniz. Destek merkezimiz üzerinden bizimle iletişime geçebilirsiniz.
              </Text>
            </PolicySection>
          </View>
        </ScrollView>

        {/* Bottom button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.understoodBtn}
            onPress={() => router.back()}
            activeOpacity={0.85}
          >
            <Text style={styles.understoodText}>Anladım</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

function BulletItem({ text }: { text: string }) {
  return (
    <View style={styles.bulletItem}>
      <Text style={styles.bulletDot}>•</Text>
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0B1A',
  },
  blobTopRight: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: PINK,
    opacity: 0.10,
  },
  blobBottomLeft: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: CYAN,
    opacity: 0.08,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(10,11,26,0.85)',
  },
  backBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: CYAN,
    fontSize: 19,
    fontWeight: '800',
    textShadowColor: 'rgba(0,212,255,0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  scrollArea: {
    flex: 1,
  },
  scroll: {
    padding: 16,
    paddingBottom: 8,
  },
  card: {
    backgroundColor: 'rgba(26,27,46,0.85)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(236,72,153,0.2)',
    padding: 20,
    shadowColor: PINK,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
    gap: 0,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionBadge: {
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.35)',
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  sectionBadgeText: {
    color: CYAN,
    fontSize: 11,
    fontWeight: '700',
  },
  sectionTitle: {
    color: CYAN,
    fontSize: 16,
    fontWeight: '700',
    textShadowColor: 'rgba(0,212,255,0.35)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  bodyText: {
    color: 'rgba(200,200,220,0.85)',
    fontSize: 13,
    lineHeight: 20,
  },
  bulletList: {
    gap: 6,
  },
  bulletItem: {
    flexDirection: 'row',
    gap: 8,
  },
  bulletDot: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    lineHeight: 20,
  },
  bulletText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(236,72,153,0.12)',
    marginVertical: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(10,11,26,0.95)',
  },
  understoodBtn: {
    backgroundColor: CYAN,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: CYAN,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  understoodText: {
    color: '#0A0B1A',
    fontSize: 16,
    fontWeight: '800',
  },
});
