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
import { LinearGradient } from 'expo-linear-gradient';

const CYAN = '#00D4FF';
const PINK = '#EC4899';

interface SectionProps {
  number: string;
  title: string;
  children: React.ReactNode;
}

function TermsSection({ number, title, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        <Text style={styles.sectionNumber}>{number}. </Text>
        {title}
      </Text>
      {children}
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

export default function TermsScreen() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <View style={styles.blobTopRight} />
      <View style={styles.blobBottomLeft} />

      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.75}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Kullanım Koşulları</Text>
          <View style={{ width: 38 }} />
        </View>

        {/* Content card */}
        <LinearGradient
          colors={[PINK, CYAN]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardBorder}
        >
          <View style={styles.cardInner}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
              <TermsSection number="1" title="Hizmet Şartları">
                <Text style={styles.bodyText}>
                  Bu uygulama tarafından sunulan AI video oluşturma hizmetlerini kullanarak, bu
                  koşulları kabul etmiş sayılırsınız. Hizmetlerimiz, en son yapay zeka teknolojilerini
                  kullanarak yaratıcı içerikler üretmenize olanak tanır. Uygulamanın kullanımı tamamen
                  yasal amaçlarla sınırlıdır.
                </Text>
              </TermsSection>

              <View style={styles.divider} />

              <TermsSection number="2" title="Kullanıcı Sorumlulukları">
                <Text style={styles.bodyText}>
                  Oluşturulan içeriklerin yasal sorumluluğu tamamen kullanıcıya aittir. Nefret söylemi,
                  telif hakkı ihlali yapan veya etik dışı içeriklerin üretilmesi kesinlikle yasaktır.
                  Hesabınızın güvenliğinden ve şifrenizin gizliliğinden siz sorumlusunuz.
                </Text>
                <View style={styles.bulletList}>
                  <BulletItem text="Hesap bilgilerinin doğru beyan edilmesi" />
                  <BulletItem text="Üçüncü şahıs haklarının korunması" />
                  <BulletItem text="Hizmetin kötüye kullanılmaması" />
                </View>
              </TermsSection>

              <View style={styles.divider} />

              <TermsSection number="3" title="Fikri Mülkiyet">
                <Text style={styles.bodyText}>
                  Uygulama arayüzü, logolar, AI modelleri ve algoritmalar platformun mülkiyetindedir.
                  Kullanıcıların ürettiği videolar üzerindeki haklar, seçilen abonelik planına göre
                  değişiklik gösterebilir. Ticari kullanım hakları için lütfen paket detaylarını inceleyin.
                </Text>
              </TermsSection>

              <View style={styles.divider} />

              <TermsSection number="4" title="Veri Gizliliği">
                <Text style={styles.bodyText}>
                  Verileriniz, siber güvenlik standartlarına uygun olarak korunmaktadır. İşleme
                  süreçleri hakkında detaylı bilgi için Gizlilik Politikamıza göz atabilirsiniz.
                </Text>
              </TermsSection>

              <View style={styles.divider} />

              <TermsSection number="5" title="Değişiklikler">
                <Text style={styles.bodyText}>
                  Hizmet koşulları, teknolojik gelişmelere bağlı olarak güncellenebilir. Değişiklikler
                  uygulama üzerinden bildirilecektir.
                </Text>
              </TermsSection>
            </ScrollView>
          </View>
        </LinearGradient>

        {/* Bottom button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={() => router.back()}
            activeOpacity={0.85}
          >
            <Text style={styles.acceptText}>KABUL EDİYORUM</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
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
    opacity: 0.12,
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
    textShadowColor: 'rgba(0,212,255,0.45)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  cardBorder: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 26,
    padding: 2,
  },
  cardInner: {
    flex: 1,
    backgroundColor: 'rgba(22,27,51,0.94)',
    borderRadius: 24,
    overflow: 'hidden',
  },
  scroll: {
    padding: 20,
    paddingBottom: 8,
    gap: 0,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: CYAN,
    fontSize: 16,
    fontWeight: '700',
    textShadowColor: 'rgba(0,212,255,0.35)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  sectionNumber: {
    color: CYAN,
    fontWeight: '700',
  },
  bodyText: {
    color: 'rgba(200,200,220,0.85)',
    fontSize: 13,
    lineHeight: 20,
  },
  bulletList: {
    gap: 6,
    marginTop: 4,
  },
  bulletItem: {
    flexDirection: 'row',
    gap: 8,
  },
  bulletDot: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    lineHeight: 20,
  },
  bulletText: {
    color: 'rgba(180,180,200,0.85)',
    fontSize: 12,
    lineHeight: 20,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,212,255,0.12)',
    marginVertical: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  acceptBtn: {
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
  acceptText: {
    color: '#0A0B1A',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
  },
});
