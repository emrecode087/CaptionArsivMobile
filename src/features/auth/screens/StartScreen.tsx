import { memo, useRef, useState, useMemo } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { Button } from '@/core/ui/Button';
import { borderRadius, spacing, typography } from '@/core/theme/tokens';
import { useTheme } from '@/core/theme/useTheme';
import type { AuthStackParamList } from '../navigation/types';
import { useAuthStore } from '../stores/useAuthStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  emoji?: string;
  image?: any;
}

interface StartScreenProps {
  navigation: StackNavigationProp<AuthStackParamList, 'Start'>;
}

export const StartScreen = memo<StartScreenProps>(({ navigation }) => {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const logoSource = isDark ? require('../../../../assets/logo.png') : require('../../../../assets/logo_light.png');

  const slides: OnboardingSlide[] = useMemo(
    () => [
      {
        id: '1',
        title: "CaptionArsiv'e Hos Geldiniz",
        description: 'En sevdiginiz sosyal medya iceriklerini tek bir yerde toplayin ve organize edin.',
        image: logoSource,
      },
      {
        id: '2',
        title: 'Kolayca Organize Edin',
        description: 'Videolari kategorilere ayirin, etiketleyin ve dilediginiz zaman kolayca bulun.',
        emoji: '📂',
      },
      {
        id: '3',
        title: 'Her Zaman Erisilebilir',
        description: 'Favori icerikleriniz artik kaybolmayacak. Istediginiz zaman, istediginiz yerden erisin.',
        emoji: '⏰',
      },
      {
        id: '4',
        title: 'Hemen Baslayin',
        description: 'Simdi kaydolun ve iceriklerinizi arsivlemeye baslayin!',
        emoji: '🚀',
      },
    ],
    [logoSource],
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const setHasSeenOnboarding = useAuthStore((state) => state.setHasSeenOnboarding);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    }
  };

  const handleSkip = () => {
    setHasSeenOnboarding();
    navigation.navigate('Login');
  };

  const handleGetStarted = () => {
    setHasSeenOnboarding();
    navigation.navigate('Login');
  };

  const isLastSlide = currentIndex === slides.length - 1;

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={styles.slide}>
      <View style={styles.emojiContainer}>
        {item.image ? (
          <Image source={item.image} style={styles.slideImage} resizeMode="contain" />
        ) : (
          <Text style={styles.emoji}>{item.emoji}</Text>
        )}
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  const renderDot = (_: OnboardingSlide, index: number) => {
    const inputRange = [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH];
    const dotWidth = scrollX.interpolate({
      inputRange,
      outputRange: [8, 24, 8],
      extrapolate: 'clamp',
    });
    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.3, 1, 0.3],
      extrapolate: 'clamp',
    });

    return <Animated.View key={index} style={[styles.dot, { width: dotWidth, opacity }]} />;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
          listener: handleScroll,
        })}
        keyExtractor={(item) => item.id}
        scrollEventThrottle={16}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>{slides.map((slide, index) => renderDot(slide, index))}</View>

        {!isLastSlide ? (
          <View style={styles.buttonContainer}>
            <Button title="Atla" variant="ghost" onPress={handleSkip} style={styles.skipButton} />
            <Button title="Devam" variant="primary" onPress={handleNext} style={styles.nextButton} />
          </View>
        ) : (
          <View style={styles.buttonContainer}>
            <Button title="Giris Yap" variant="outline" onPress={handleGetStarted} style={styles.authButton} />
            <Button
              title="Kayit Ol"
              variant="primary"
              onPress={() => {
                setHasSeenOnboarding();
                navigation.navigate('Register');
              }}
              style={styles.authButton}
            />
          </View>
        )}
      </View>
    </View>
  );
});

StartScreen.displayName = 'StartScreen';

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    slide: {
      width: SCREEN_WIDTH,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xxl,
      alignItems: 'center',
      gap: spacing.lg,
    },
    emojiContainer: {
      width: SCREEN_WIDTH * 0.7,
      height: SCREEN_HEIGHT * 0.32,
      borderRadius: borderRadius.xl,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.shadow,
      shadowOpacity: 0.15,
      shadowOffset: { width: 0, height: 10 },
      shadowRadius: 20,
      elevation: 8,
      padding: spacing.lg,
    },
    emoji: {
      fontSize: 72,
    },
    slideImage: {
      width: '80%',
      height: '80%',
    },
    title: {
      ...typography.h3,
      color: colors.text.primary,
      textAlign: 'center',
    },
    description: {
      ...typography.body,
      color: colors.text.secondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    footer: {
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.lg,
      gap: spacing.lg,
    },
    pagination: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
    },
    dot: {
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: spacing.md,
      justifyContent: 'center',
    },
    skipButton: {
      flex: 1,
    },
    nextButton: {
      flex: 1,
    },
    authButton: {
      flex: 1,
    },
  });

export default StartScreen;
