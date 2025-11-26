import React, { useState, useRef, useMemo } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { CustomHeader } from '@/core/ui/CustomHeader';
import { SubMenu, MainTabType } from '@/core/ui/SubMenu';
import { BannerAd } from '@/core/ui/BannerAd';
import { HomeScreen } from '@/features/home/screens/HomeScreen';
import { CollectionsScreen } from '@/features/collections/screens/CollectionsScreen';
import { useTheme } from '@/core/theme/useTheme';
import { usePermissions } from '@/features/auth/hooks/usePermissions';

const HEADER_HEIGHT = 56; // Approximate CustomHeader height
const SUBMENU_HEIGHT = 56; // Approximate SubMenu height (16+16+24)

export const MainScreen = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { canCreatePost } = usePermissions();
  
  const [activeTab, setActiveTab] = useState<MainTabType>('home');

  // Calculate total header height including safe area
  const totalHeaderHeight = HEADER_HEIGHT + SUBMENU_HEIGHT + insets.top;

  // Animation Logic
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Clamp scrollY to avoid negative values (overscroll) affecting the diffClamp
  const clampedScrollY = useRef(
    scrollY.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
      extrapolateLeft: 'clamp',
    })
  ).current;
  
  // Re-create diffClamp when totalHeaderHeight changes
  const diffClamp = useMemo(() => 
    Animated.diffClamp(clampedScrollY, 0, totalHeaderHeight),
    [clampedScrollY, totalHeaderHeight]
  );
  
  const translateY = diffClamp.interpolate({
    inputRange: [0, totalHeaderHeight],
    outputRange: [0, -totalHeaderHeight],
  });

  const fabTranslateY = diffClamp.interpolate({
    inputRange: [0, totalHeaderHeight],
    outputRange: [200, 0], // Hidden (pushed down) -> Visible (at position)
  });

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      backgroundColor: colors.surface,
      elevation: 4,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    fabContainer: {
      position: 'absolute',
      right: 24,
      zIndex: 900,
    },
    fab: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 6,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
  }), [colors]);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true }
  );

  const renderContent = () => {
    // Add padding to top so content starts below the header
    // Add padding to bottom for FAB and Banner
    const contentContainerStyle = { 
      paddingTop: totalHeaderHeight,
      paddingBottom: 150 // Increased padding for Banner + FAB space
    };
    
    if (activeTab === 'collections') {
      return (
        <CollectionsScreen 
          onScroll={handleScroll} 
          contentContainerStyle={contentContainerStyle}
        />
      );
    }

    // Map tabs to filter/sort
    const filterMap: Record<string, string> = {
      'home': 'forYou',
      'top': 'top',
      'fresh': 'fresh'
    };

    return (
      <HomeScreen 
        filter={filterMap[activeTab] as any} 
        onScroll={handleScroll}
        contentContainerStyle={contentContainerStyle}
      />
    );
  };

  return (
    <View style={styles.container}>
      {renderContent()}

      <Animated.View 
        style={[
          styles.headerContainer, 
          { 
            // Removed paddingTop: insets.top because CustomHeader handles it
            transform: [{ translateY }] 
          }
        ]}
      >
        <CustomHeader 
          onNotificationPress={() => navigation.navigate('Notifications')}
        />
        <SubMenu activeTab={activeTab} onTabPress={setActiveTab} />
      </Animated.View>

      {canCreatePost && ['home', 'top', 'fresh'].includes(activeTab) && (
        <Animated.View 
          style={[
            styles.fabContainer, 
            { 
              bottom: insets.bottom + 90, // Positioned above the banner
              transform: [{ translateY: fabTranslateY }]
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.fab}
            onPress={() => navigation.navigate('CreatePost')}
          >
            <Ionicons name="add" size={32} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      )}
      
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        <BannerAd />
      </View>
    </View>
  );
};
