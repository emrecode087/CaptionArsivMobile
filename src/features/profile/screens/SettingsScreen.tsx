import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/core/theme/useTheme';
import { spacing, typography, borderRadius } from '@/core/theme/tokens';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { useUpdateUserMutation } from '@/features/profile/data/useProfileMutations';

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
  showDivider = true,
  danger = false,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  showDivider?: boolean;
  danger?: boolean;
}) => {
  const { colors } = useTheme();
  return (
    <View>
      <TouchableOpacity onPress={onPress} style={styles.row} activeOpacity={onPress ? 0.7 : 1}>
        <View style={styles.rowLeft}>
          <Text style={[styles.rowTitle, { color: danger ? '#d32f2f' : colors.text.primary }]}>{title}</Text>
        </View>
        <View style={styles.rowRight}>
          {right ?? <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />}
        </View>
      </TouchableOpacity>
      {showDivider && <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />}
    </View>
  );
};

export const SettingsScreen = ({ navigation }: any) => {
  const { colors, setThemeMode, themeMode } = useTheme();
  const user = useAuthStore((state) => state.user);
  const updateUserMutation = useUpdateUserMutation();

  const [followThreadOnReply, setFollowThreadOnReply] = useState<boolean>(user?.autoFollowOnReply ?? false);
  const [clearCacheOnAction, setClearCacheOnAction] = useState(false);

  const [darkMode, setDarkMode] = useState(themeMode === 'dark');

  const [hideOffensiveComments, setHideOffensiveComments] = useState(user?.hideFlaggedComments ?? true);

  const [pushNotifications, setPushNotifications] = useState(user?.pushNotificationsEnabled ?? true);

  const [autoplayModalVisible, setAutoplayModalVisible] = useState(false);
  const [autoplayOption, setAutoplayOption] = useState<'always' | 'wifi' | 'never'>(
    user?.autoplayVideos === false ? 'never' : 'always'
  );

  useEffect(() => {
    setFollowThreadOnReply(user?.autoFollowOnReply ?? false);
    setHideOffensiveComments(user?.hideFlaggedComments ?? true);
    setPushNotifications(user?.pushNotificationsEnabled ?? true);
    setAutoplayOption(user?.autoplayVideos === false ? 'never' : 'always');
  }, [user?.autoFollowOnReply, user?.hideFlaggedComments, user?.pushNotificationsEnabled, user?.autoplayVideos]);

  useEffect(() => {
    setDarkMode(themeMode === 'dark');
  }, [themeMode]);

  const handleAutoFollowToggle = (value: boolean) => {
    const previous = user?.autoFollowOnReply ?? false;
    setFollowThreadOnReply(value);
    if (!user) return;

    updateUserMutation.mutate(
      { userId: user.id, payload: { autoFollowOnReply: value } },
      {
        onError: () => {
          setFollowThreadOnReply(previous);
        },
      },
    );
  };

  const handleHideFlaggedToggle = (value: boolean) => {
    const previous = user?.hideFlaggedComments ?? true;
    setHideOffensiveComments(value);
    if (!user) return;

    updateUserMutation.mutate(
      { userId: user.id, payload: { hideFlaggedComments: value } },
      {
        onError: () => setHideOffensiveComments(previous),
      },
    );
  };

  const handlePushToggle = (value: boolean) => {
    const previous = user?.pushNotificationsEnabled ?? true;
    setPushNotifications(value);
    if (!user) return;

    updateUserMutation.mutate(
      { userId: user.id, payload: { pushNotificationsEnabled: value } },
      {
        onError: () => setPushNotifications(previous),
      },
    );
  };

  const handleDarkModeToggle = (value: boolean) => {
    const previousMode = themeMode;
    setDarkMode(value);
    setThemeMode(value ? 'dark' : 'light');

    if (!user) return;

    updateUserMutation.mutate(
      { userId: user.id, payload: { theme: value ? 'dark' : 'light' } },
      {
        onError: () => {
          setDarkMode(previousMode === 'dark');
          setThemeMode(previousMode || 'light');
        },
      },
    );
  };

  const handleAutoplayOption = (option: 'always' | 'wifi' | 'never') => {
    const previous = user?.autoplayVideos ?? true;
    setAutoplayOption(option);
    if (!user) return;

    updateUserMutation.mutate(
      { userId: user.id, payload: { autoplayVideos: option !== 'never' } },
      {
        onError: () => setAutoplayOption(previous ? 'always' : 'never'),
      },
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <SectionHeader title="Gelişmiş" />
          <Row
            title="Cevaplara otomatik takip"
            right={
              <Switch
                value={followThreadOnReply}
                onValueChange={handleAutoFollowToggle}
                disabled={updateUserMutation.isPending}
              />
            }
          />
          <Row
            title="Önbelleği temizle"
            onPress={() => setClearCacheOnAction(true)}
            showDivider={false}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Görüntü" />
          <Row
            title="Karanlık Mod"
            right={
              <Switch
                value={darkMode}
                onValueChange={handleDarkModeToggle}
                disabled={updateUserMutation.isPending}
              />
            }
            showDivider={false}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Gösterilen İçerikler" />
          <Row
            title="Kötü niyetli yorumları gizle"
            right={
              <Switch
                value={hideOffensiveComments}
                onValueChange={handleHideFlaggedToggle}
                disabled={updateUserMutation.isPending}
              />
            }
          />
          <Row title="Engellenmiş başlıklar" onPress={() => navigation.navigate('BlockedCategories')} />
          <Row title="Engellenmiş ilgi alanları" onPress={() => navigation.navigate('BlockedCategories')} />
          <Row title="Engellenmiş etiketler" onPress={() => navigation.navigate('BlockedTags')} />
          <Row title="Engellenmiş kullanıcılar" onPress={() => navigation.navigate('BlockedUsers')} showDivider={false} />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Hesap" />
          <Row title="Profili düzenle" onPress={() => navigation.navigate('EditProfile')} />
          <Row title="Şifre değiştir" onPress={() => navigation.navigate('ChangePassword')} />
          <Row title="Bağlı hesaplar" onPress={() => navigation.navigate('LinkedAccounts')} />
          <Row
            title="Push bildirimleri"
            right={
              <Switch
                value={pushNotifications}
                onValueChange={handlePushToggle}
                disabled={updateUserMutation.isPending}
              />
            }
          />
          <Row title="Gizlilik ayarları" onPress={() => navigation.navigate('PrivacySettings')} />
          <Row title="Çıkış Yap" onPress={() => { /* implement logout navigation */ }} showDivider={false} />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Veri Tasarrufu" />
          <Row
            title="Videoları otomatik oynat"
            onPress={() => setAutoplayModalVisible(true)}
            showDivider={false}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Hakkında" />
          <Row title="Yardım Merkezi" onPress={() => navigation.navigate('HelpCenter')} />
          <Row title="Geri Bildirim Gönder" onPress={() => navigation.navigate('SendFeedback')} />
          <Row title="Bizi Twitter'da takip et" onPress={() => { }} />
          <Row title="Bizi Instagram'da takip et" onPress={() => { }} />
          <Row title="Telif Hakkı" onPress={() => navigation.navigate('Copyright')} />
          <Row title="Gizlilik Politikası" onPress={() => navigation.navigate('PrivacyPolicy')} />
          <Row title="Uygulama sürümü" right={<Text style={[styles.rowSubtitle, { color: colors.text.secondary }]}>1.0.0</Text>} onPress={() => { }} showDivider={false} />
        </View>

        <View style={styles.section}>
          <Row title="HESABI SİL" onPress={() => { /* show confirm delete */ }} showDivider={false} danger />
        </View>
      </ScrollView>

      <Modal visible={autoplayModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text.primary }]}>Videoları otomatik oynat</Text>
            <TouchableOpacity style={styles.modalOption} onPress={() => { handleAutoplayOption('always'); setAutoplayModalVisible(false); }}>
              <Text style={[styles.modalOptionText, { color: colors.text.primary }]}>Her zaman</Text>
              {autoplayOption === 'always' && <Ionicons name="checkmark" size={20} color={colors.primary} />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={() => { handleAutoplayOption('never'); setAutoplayModalVisible(false); }}>
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
    paddingBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.md,
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  sectionHeader: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sectionHeaderText: {
    ...typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: 'space-between',
  },
  rowLeft: {
    flex: 1,
  },
  rowTitle: {
    ...typography.body2,
  },
  rowSubtitle: {
    ...typography.caption,
    marginTop: 2,
  },
  rowRight: {
    marginLeft: spacing.md,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: spacing.md,
    marginRight: spacing.md,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    padding: spacing.md,
    borderTopLeftRadius: borderRadius.md,
    borderTopRightRadius: borderRadius.md,
  },
  modalTitle: {
    ...typography.h4,
    marginBottom: spacing.md,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
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
