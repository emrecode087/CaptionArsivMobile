import { memo, useMemo } from 'react';
import { StyleSheet, Text, View, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Button } from '@/core/ui/Button';
import { spacing, typography, borderRadius } from '@/core/theme/tokens';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { useTheme } from '@/core/theme/useTheme';

export const ProfileScreen = memo(() => {
  const { user, logout } = useAuthStore();
  const { colors, themeMode, setThemeMode } = useTheme();

  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: () => {
            // Logout işlemi
            logout();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profilim</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {user?.profileImageUrl ? (
              <Image source={{ uri: user.profileImageUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {user?.userName?.charAt(0).toUpperCase() || '?'}
                </Text>
              </View>
            )}
          </View>
          
          <Text style={styles.username}>@{user?.userName || 'Kullanıcı'}</Text>
          <Text style={styles.email}>{user?.email || ''}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Gönderi</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Takipçi</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Takip</Text>
            </View>
          </View>
        </View>

        <View style={styles.menuContainer}>
          <View style={styles.themeSection}>
            <Text style={styles.sectionTitle}>Tema</Text>
            <View style={styles.themeButtons}>
                <Button 
                    title="Aydınlık" 
                    variant={themeMode === 'light' ? 'primary' : 'outline'} 
                    onPress={() => setThemeMode('light')}
                    size="small"
                    style={{ flex: 1 }}
                />
                <Button 
                    title="Karanlık" 
                    variant={themeMode === 'dark' ? 'primary' : 'outline'} 
                    onPress={() => setThemeMode('dark')}
                    size="small"
                    style={{ flex: 1 }}
                />
                <Button 
                    title="Otomatik" 
                    variant={themeMode === 'system' ? 'primary' : 'outline'} 
                    onPress={() => setThemeMode('system')}
                    size="small"
                    style={{ flex: 1 }}
                />
            </View>
          </View>

          <Button
            title="Çıkış Yap"
            onPress={handleLogout}
            variant="outline"
            style={styles.logoutButton}
            textStyle={styles.logoutButtonText}
            icon={<Ionicons name="log-out-outline" size={20} color={colors.error} />}
          />
        </View>
      </View>
    </SafeAreaView>
  );
});

ProfileScreen.displayName = 'ProfileScreen';

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.xl,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarContainer: {
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: colors.surface,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.surface,
  },
  avatarText: {
    ...typography.h2,
    color: colors.text.inverse,
  },
  username: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  email: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    ...typography.h4,
    color: colors.text.primary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: colors.divider,
  },
  menuContainer: {
    gap: spacing.md,
  },
  logoutButton: {
    borderColor: colors.error,
  },
  logoutButtonText: {
    color: colors.error,
  },
  themeSection: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.subtitle2,
    color: colors.text.secondary,
  },
  themeButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
