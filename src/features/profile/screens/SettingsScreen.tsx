import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/core/theme/useTheme';
import { spacing, typography, borderRadius } from '@/core/theme/tokens';

const SectionHeader = ({ title }: { title: string }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.sectionHeader, { borderBottomColor: colors.border }]}>
      <Text style={[styles.sectionHeaderText, { color: colors.text.secondary }]}>{title}</Text>
    </View>
  );
};

const Row = ({
  title,
  subtitle,
  right,
  onPress,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
}) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity onPress={onPress} style={[styles.row, { borderBottomColor: colors.border }]} activeOpacity={onPress ? 0.7 : 1}>
      <View style={styles.rowLeft}>
        <Text style={[styles.rowTitle, { color: colors.text.primary }]}>{title}</Text>
        {subtitle ? <Text style={[styles.rowSubtitle, { color: colors.text.tertiary }]}>{subtitle}</Text> : null}
      </View>
      <View style={styles.rowRight}>{right ?? <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />}</View>
    </TouchableOpacity>
  );
};

export const SettingsScreen = ({ navigation }: any) => {
  const { colors } = useTheme();

  const [followThreadOnReply, setFollowThreadOnReply] = useState(true);
  const [clearCacheOnAction, setClearCacheOnAction] = useState(false);

  const [darkMode, setDarkMode] = useState(false);

  const [hideOffensiveComments, setHideOffensiveComments] = useState(true);

  const [pushNotifications, setPushNotifications] = useState(true);

  const [autoplayModalVisible, setAutoplayModalVisible] = useState(false);
  const [autoplayOption, setAutoplayOption] = useState<'always' | 'wifi' | 'never'>('wifi');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <SectionHeader title="Gelişmiş" />
        <Row
          title="Cevaplara otomatik takip"
          subtitle="Cevap yazdığınız konuları takip et"
          right={<Switch value={followThreadOnReply} onValueChange={setFollowThreadOnReply} />}
        />
        <Row
          title="Önbelleği temizle"
          subtitle="Uygulama cache'ini temizle"
          onPress={() => setClearCacheOnAction(true)}
        />

        <SectionHeader title="Görüntü" />
        <Row title="Karanlık Mod" right={<Switch value={darkMode} onValueChange={setDarkMode} />} />

        <SectionHeader title="Gösterilen İçerikler" />
        <Row
          title="Kötü niyetli yorumları gizle"
          subtitle="Rahatsız edici içerikleri filtrele"
          right={<Switch value={hideOffensiveComments} onValueChange={setHideOffensiveComments} />}
        />
        <Row title="Engellenmiş başlıklar" onPress={() => navigation.navigate('BlockedTitles')} />
        <Row title="Engellenmiş ilgi alanları" onPress={() => navigation.navigate('BlockedInterests')} />
        <Row title="Engellenmiş etiketler" onPress={() => navigation.navigate('BlockedTags')} />
        <Row title="Engellenmiş kullanıcılar" onPress={() => navigation.navigate('BlockedUsers')} />

        <SectionHeader title="Hesap" />
        <Row title="Profili düzenle" onPress={() => navigation.navigate('EditProfile')} />
        <Row title="Şifre değiştir" onPress={() => navigation.navigate('ChangePassword')} />
        <Row title="Bağlı hesaplar" onPress={() => navigation.navigate('LinkedAccounts')} />
        <Row
          title="Push bildirimleri"
          subtitle="Cihaz bildirim ayarları"
          right={<Switch value={pushNotifications} onValueChange={setPushNotifications} />}
        />
        <Row title="Gizlilik ayarları" onPress={() => navigation.navigate('PrivacySettings')} />
        <Row title="Çıkış Yap" onPress={() => {/* implement logout navigation */}} />

        <SectionHeader title="Veri Tasarrufu" />
        <Row
          title="Videoları otomatik oynat"
          subtitle={autoplayOption === 'always' ? 'Her zaman' : autoplayOption === 'wifi' ? 'Sadece Wi‑Fi' : 'Asla'}
          onPress={() => setAutoplayModalVisible(true)}
        />

        <SectionHeader title="Hakkında" />
        <Row title="Yardım Merkezi" onPress={() => navigation.navigate('HelpCenter')} />
        <Row title="Geri Bildirim Gönder" onPress={() => navigation.navigate('SendFeedback')} />
        <Row title="Bizi Twitter'da takip et" onPress={() => {}} />
        <Row title="Bizi Instagram'da takip et" onPress={() => {}} />
        <Row title="Telif Hakkı" onPress={() => navigation.navigate('Copyright')} />
        <Row title="Gizlilik Politikası" onPress={() => navigation.navigate('PrivacyPolicy')} />
        <Row title="Uygulama sürümü" subtitle="1.0.0" onPress={() => {}} />

        <View style={styles.footer}>
          <Pressable style={styles.deleteButton} onPress={() => {/* show confirm delete */}}>
            <Text style={styles.deleteButtonText}>HESABI SİL</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal visible={autoplayModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text.primary }]}>Videoları otomatik oynat</Text>
            <TouchableOpacity style={styles.modalOption} onPress={() => { setAutoplayOption('always'); setAutoplayModalVisible(false); }}>
              <Text style={[styles.modalOptionText, { color: colors.text.primary }]}>Her zaman</Text>
              {autoplayOption === 'always' && <Ionicons name="checkmark" size={20} color={colors.primary} />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={() => { setAutoplayOption('wifi'); setAutoplayModalVisible(false); }}>
              <Text style={[styles.modalOptionText, { color: colors.text.primary }]}>Sadece Wi‑Fi</Text>
              {autoplayOption === 'wifi' && <Ionicons name="checkmark" size={20} color={colors.primary} />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={() => { setAutoplayOption('never'); setAutoplayModalVisible(false); }}>
              <Text style={[styles.modalOptionText, { color: colors.text.primary }]}>Asla</Text>
              {autoplayOption === 'never' && <Ionicons name="checkmark" size={20} color={colors.primary} />}
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalClose} onPress={() => setAutoplayModalVisible(false)}>
              <Text style={[styles.modalCloseText, { color: colors.primary }]}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  sectionHeader: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  sectionHeaderText: {
    ...typography.caption,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    justifyContent: 'space-between',
  },
  rowLeft: {
    flex: 1,
  },
  rowTitle: {
    ...typography.body,
  },
  rowSubtitle: {
    ...typography.caption,
    marginTop: 4,
  },
  rowRight: {
    marginLeft: spacing.md,
  },
  footer: {
    padding: spacing.md,
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#d32f2f',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    padding: spacing.md,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  modalTitle: {
    ...typography.h5,
    marginBottom: spacing.md,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)'
  },
  modalOptionText: {
    ...typography.body,
  },
  modalClose: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  modalCloseText: {
    ...typography.body,
    fontWeight: '700',
  },
});

export default SettingsScreen;
