import { memo } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Image } from 'react-native';

import { CategoriesScreen } from '@/features/categories/screens/CategoriesScreen';
import { CategoryPostsScreen } from '@/features/categories/screens/CategoryPostsScreen';
import { MainScreen } from '@/features/home/screens/MainScreen';
import { ProfileScreen } from '@/features/profile/screens/ProfileScreen';
import { CollectionDetailScreen } from '@/features/collections/screens/CollectionDetailScreen';
import { useTheme } from '@/core/theme/useTheme';
import { Sidebar } from '@/core/ui/Sidebar';
import { LikedPostsScreen } from '@/features/posts/screens/LikedPostsScreen';
import { BlockUsersScreen } from '@/features/blocks/screens/BlockUsersScreen';
import { BlockTagsScreen } from '@/features/blocks/screens/BlockTagsScreen';
import { BlockCategoriesScreen } from '@/features/blocks/screens/BlockCategoriesScreen';

const Stack = createStackNavigator();

import { CreatePostScreen } from '@/features/posts/screens/CreatePostScreen';
import { PostDetailScreen } from '@/features/posts/screens/PostDetailScreen';
import { NotificationsScreen } from '@/features/notifications/screens/NotificationsScreen';
import SettingsScreen from '@/features/profile/screens/SettingsScreen';

export const MainNavigator = memo(() => {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1 }}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="CreatePost" component={CreatePostScreen} />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen} 
          options={{ 
            headerShown: true, 
            title: 'Profilim', 
            headerTintColor: colors.text.primary, 
            headerStyle: { backgroundColor: colors.surface } 
          }} 
        />
        <Stack.Screen 
          name="PostDetail" 
          component={PostDetailScreen}
          options={{
            headerShown: true,
            headerTitle: () => (
              <Image 
                source={require('../../assets/logo.png')} 
                style={{ width: 120, height: 40 }} 
                resizeMode="contain" 
              />
            ),
            headerTitleAlign: 'center',
            headerTintColor: colors.text.primary,
            headerStyle: {
              backgroundColor: colors.surface,
            },
          }}
        />
        <Stack.Screen 
          name="CategoryPosts" 
          component={CategoryPostsScreen}
          options={{
            headerShown: true,
            headerTintColor: colors.text.primary,
            headerStyle: {
              backgroundColor: colors.surface,
            },
          }}
        />
        <Stack.Screen 
          name="CategoriesManagement" 
          component={CategoriesScreen}
          options={{
            headerShown: true,
            title: 'Kategori Yönetimi',
            headerTintColor: colors.text.primary,
            headerStyle: {
              backgroundColor: colors.surface,
            },
          }}
        />
        <Stack.Screen 
          name="CollectionDetail" 
          component={CollectionDetailScreen}
          options={{
            headerShown: true,
            title: 'Collection Details',
            headerTintColor: colors.text.primary,
            headerStyle: {
              backgroundColor: colors.surface,
            },
          }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            headerShown: true,
            title: 'Ayarlar',
            headerTintColor: colors.text.primary,
            headerStyle: { backgroundColor: colors.surface },
          }}
        />
        <Stack.Screen
          name="LikedPosts"
          component={LikedPostsScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="BlockedUsers"
          component={BlockUsersScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BlockedTags"
          component={BlockTagsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BlockedCategories"
          component={BlockCategoriesScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
      <Sidebar />
    </View>
  );
});

MainNavigator.displayName = 'MainNavigator';
