import { memo } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Image } from 'react-native';

import { CategoriesScreen } from '@/features/categories/screens/CategoriesScreen';
import { CategoryPostsScreen } from '@/features/categories/screens/CategoryPostsScreen';
import { HomeScreen } from '@/features/home/screens/HomeScreen';
import { ProfileScreen } from '@/features/profile/screens/ProfileScreen';
import { CollectionsScreen } from '@/features/collections/screens/CollectionsScreen';
import { CollectionDetailScreen } from '@/features/collections/screens/CollectionDetailScreen';
import { useTheme } from '@/core/theme/useTheme';
import { CustomHeader } from '@/core/ui/CustomHeader';
import { Sidebar } from '@/core/ui/Sidebar';
import { usePermissions } from '@/features/auth/hooks/usePermissions';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

import { CreatePostScreen } from '@/features/posts/screens/CreatePostScreen';
import { PostDetailScreen } from '@/features/posts/screens/PostDetailScreen';

// Placeholder for the Add tab since we'll intercept the press
const AddPlaceholder = () => {
  const { colors } = useTheme();
  return <View style={{ flex: 1, backgroundColor: colors.background }} />;
};

const BottomTabNavigator = () => {
  const { canCreatePost } = usePermissions();
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    tabBar: {
      backgroundColor: colors.surface,
      borderTopWidth: 0,
      elevation: 8,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      height: 60,
      paddingBottom: 8,
    },
    addButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
  });

  return (
    <Tab.Navigator
      screenOptions={{
        header: () => <CustomHeader />,
        headerShown: true,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.tertiary,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Collections"
        component={CollectionsScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'albums' : 'albums-outline'} size={size} color={color} />
          ),
        }}
      />
      {canCreatePost && (
        <Tab.Screen
          name="Add"
          component={AddPlaceholder}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              navigation.navigate('CreatePost');
            },
          })}
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={styles.addButton}>
                <Ionicons name="add" size={32} color="#fff" />
              </View>
            ),
          }}
        />
      )}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const MainNavigator = memo(() => {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1 }}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={BottomTabNavigator} />
        <Stack.Screen name="CreatePost" component={CreatePostScreen} />
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
      </Stack.Navigator>
      <Sidebar />
    </View>
  );
});

MainNavigator.displayName = 'MainNavigator';
