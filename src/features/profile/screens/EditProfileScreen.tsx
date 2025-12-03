import React, { useMemo, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { useTheme } from '@/core/theme/useTheme';
import { borderRadius, spacing, typography } from '@/core/theme/tokens';
import { Button } from '@/core/ui/Button';
import { Input } from '@/core/ui/Input';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import {
  useUpdateUserMutation,
  useUploadProfilePhotoMutation,
  useDeleteProfilePhotoMutation,
} from '@/features/profile/data/useProfileMutations';
import { resolveMediaUrl } from '@/core/utils/mediaUrl';

export const EditProfileScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const updateUserMutation = useUpdateUserMutation();
  const uploadProfilePhotoMutation = useUploadProfilePhotoMutation();
  const deleteProfilePhotoMutation = useDeleteProfilePhotoMutation();

  const styles = useMemo(() => createStyles(colors), [colors]);

  const [userName, setUserName] = useState(user?.userName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [profileImageUrl, setProfileImageUrl] = useState(user?.profileImageUrl ?? '');
  const [localPhotoUri, setLocalPhotoUri] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ userName?: string; email?: string }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const previewUri = localPhotoUri || resolveMediaUrl(profileImageUrl) || undefined;
  const isUploadingPhoto = uploadProfilePhotoMutation.isPending;
  const isDeletingPhoto = deleteProfilePhotoMutation.isPending;

  const validate = () => {
    const errors: { userName?: string; email?: string } = {};

    if (!userName.trim()) {
      errors.userName = 'Kullanici adi zorunlu';
    }

    if (!email.trim()) {
      errors.email = 'E-posta zorunlu';
    } else if (!email.includes('@')) {
      errors.email = 'Gecerli bir e-posta gir';
    }

    return errors;
  };

  const handlePickImage = async () => {
    if (!user) {
      setGeneralError('Oturum acman gerekiyor.');
      return;
    }

    setUploadError(null);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      setUploadError('Galeriye erisim izni gerekiyor.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const asset = result.assets[0];

    if (!asset?.uri) {
      setUploadError('Gecersiz gorsel secimi.');
      return;
    }

    const fileName = asset.fileName ?? asset.uri.split('/').pop() ?? 'profile.jpg';

    setLocalPhotoUri(asset.uri);

    uploadProfilePhotoMutation.mutate(
      { uri: asset.uri, name: fileName, type: asset.mimeType ?? 'image/jpeg' },
      {
        onSuccess: (updatedUser) => {
          setProfileImageUrl(updatedUser.profileImageUrl ?? '');
          setLocalPhotoUri(null);
        },
        onError: (error: any) => {
          setUploadError(error?.message ?? 'Profil fotografi yuklenemedi');
          setLocalPhotoUri(null);
        },
      },
    );
  };

  const handleDeletePhoto = () => {
    if (!user) {
      setGeneralError('Oturum acman gerekiyor.');
      return;
    }

    setUploadError(null);
    deleteProfilePhotoMutation.mutate(undefined, {
      onSuccess: (updatedUser) => {
        setProfileImageUrl(updatedUser.profileImageUrl ?? '');
        setLocalPhotoUri(null);
      },
      onError: (error: any) => {
        setUploadError(error?.message ?? 'Profil fotografi silinemedi');
      },
    });
  };

  const handleSave = () => {
    if (!user) {
      setGeneralError('Oturum acman gerekiyor.');
      return;
    }

    if (uploadProfilePhotoMutation.isPending) {
      setGeneralError('Profil fotografi yukleniyor, lutfen bekle.');
      return;
    }

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setGeneralError(null);

    updateUserMutation.mutate(
      {
        userId: user.id,
        payload: {
          userName: userName.trim(),
          email: email.trim(),
          bio: bio.trim() ? bio.trim() : null,
          profileImageUrl: profileImageUrl.trim() ? profileImageUrl.trim() : null,
        },
      },
      {
        onSuccess: () => {
          Alert.alert('Profil guncellendi', 'Degisiklikler kaydedildi.');
          navigation.goBack();
        },
        onError: (error: any) => {
          setGeneralError(error?.message ?? 'Profil guncellenemedi');
        },
      },
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text.primary }]}>Profili duzenle</Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          Kullanici bilgilerini guncelle ve profilini guncel tut.
        </Text>

        <View style={styles.avatarSection}>
          <View style={styles.avatarPreview}>
            {previewUri ? (
              <Image source={{ uri: previewUri }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarPlaceholderText}>
                {user?.userName?.charAt(0).toUpperCase() || '?'}
              </Text>
            )}
          </View>
          <View style={styles.avatarInfo}>
            <Text style={styles.avatarTitle}>Avatarini degistir</Text>
            <Text style={styles.avatarSubtitle}>
              Kare bir foto secip yukle. JPG veya PNG desteklenir.
            </Text>
            <Button
              title={previewUri ? 'Avatarini degistir' : 'Avatar sec ve yukle'}
              variant="outline"
              size="small"
              onPress={handlePickImage}
              loading={isUploadingPhoto}
              disabled={isUploadingPhoto || isDeletingPhoto}
            />
            {previewUri && (
              <Button
                title="Avatari kaldir"
                variant="ghost"
                size="small"
                onPress={handleDeletePhoto}
                loading={isDeletingPhoto}
                disabled={isUploadingPhoto || isDeletingPhoto}
                textStyle={{ color: colors.error }}
              />
            )}
          </View>
        </View>
        {uploadError && <Text style={[styles.errorText, { color: colors.error }]}>{uploadError}</Text>}

        <Input
          label="Kullanici adi"
          placeholder="kullanici_adi"
          value={userName}
          onChangeText={setUserName}
          autoCapitalize="none"
          autoCorrect={false}
          error={fieldErrors.userName}
        />

        <Input
          label="E-posta"
          placeholder="ornek@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          error={fieldErrors.email}
        />

        <Input
          label="Bio"
          placeholder="Kendini kisaca tanit..."
          value={bio ?? ''}
          onChangeText={setBio}
          multiline
          numberOfLines={3}
          style={{ minHeight: 90, textAlignVertical: 'top' }}
          hint="Topluluga kendini tanit."
        />

        {generalError && <Text style={[styles.errorText, { color: colors.error }]}>{generalError}</Text>}

        <Button
          title="Kaydet"
          onPress={handleSave}
          loading={updateUserMutation.isPending}
          disabled={isUploadingPhoto || isDeletingPhoto}
          fullWidth
          style={styles.saveButton}
        />
      </View>
    </ScrollView>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      padding: spacing.lg,
    },
    card: {
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      gap: spacing.md,
      borderWidth: 1,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.05,
      shadowRadius: 20,
      elevation: 3,
    },
    title: {
      ...typography.h3,
    },
    subtitle: {
      ...typography.body,
      marginBottom: spacing.sm,
    },
    avatarSection: {
      flexDirection: 'row',
      gap: spacing.md,
      padding: spacing.md,
      borderWidth: 1,
      borderRadius: borderRadius.lg,
      borderColor: colors.border,
      backgroundColor: colors.surfaceHighlight,
      alignItems: 'center',
    },
    avatarPreview: {
      width: 96,
      height: 96,
      borderRadius: borderRadius.full,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      backgroundColor: colors.surface,
    },
    avatarImage: {
      width: '100%',
      height: '100%',
    },
    avatarPlaceholderText: {
      ...typography.h3,
      color: colors.text.secondary,
    },
    avatarInfo: {
      flex: 1,
      gap: spacing.xs,
    },
    avatarTitle: {
      ...typography.subtitle1,
      color: colors.text.primary,
    },
    avatarSubtitle: {
      ...typography.body2,
      color: colors.text.secondary,
    },
    errorText: {
      ...typography.body,
      marginTop: spacing.xs,
    },
    saveButton: {
      marginTop: spacing.sm,
    },
  });

export default EditProfileScreen;
