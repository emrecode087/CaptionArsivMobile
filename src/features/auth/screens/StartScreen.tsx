import { memo, useRef, useState } from 'react';
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
import { borderRadius, colors, spacing, typography } from '@/core/theme/tokens';
import type { AuthStackParamList } from '../navigation/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  emoji: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    title: 'CaptionArşiv\'e Hoş Geldiniz',
    description: 'En sevdiğiniz sosyal medya içeriklerini tek bir yerde toplayın ve organize edin.',
    emoji: '🎬',
  },
  {
    id: '2',
    title: 'Kolayca Organize Edin',
    description: 'Videoları kategorilere ayırın, etiketleyin ve dilediğiniz zaman kolayca bulun.',
    emoji: '📁',
  },
  {
    id: '3',
    title: 'Her Zaman Erişilebilir',
    description: 'Favori içerikleriniz artık kaybolmayacak. İstediğiniz zaman, istediğiniz yerden erişin.',
    emoji: '☁️',
  },
  {
    id: '4',
    title: 'Hemen Başlayın',
    description: 'Şimdi kaydolun ve içeriklerinizi arşivlemeye başlayın!',
    emoji: '🚀',
  },
];

interface StartScreenProps {
  navigation: StackNavigationProp<AuthStackParamList, 'Start'>;
}

export const StartScreen = memo<StartScreenProps>(({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    }
  };

  const handleSkip = () => {
    navigation.navigate('Login');
  };

  const handleGetStarted = () => {
    navigation.navigate('Login');
  };

  const isLastSlide = currentIndex === SLIDES.length - 1;

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={styles.slide}>
      <View style={styles.emojiContainer}>
        <Text style={styles.emoji}>{item.emoji}</Text>
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  const renderDot = (_: any, index: number) => {
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

    return (
      <Animated.View
        key={index}
        style={[styles.dot, { width: dotWidth, opacity }]}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
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
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => renderDot(_, index))}
        </View>

        {!isLastSlide ? (
          <View style={styles.buttonContainer}>
            <Button title="Atla" variant="ghost" onPress={handleSkip} style={styles.skipButton} />
            <Button title="Devam" variant="primary" onPress={handleNext} style={styles.nextButton} />
          </View>
        ) : (
          <View style={styles.buttonContainer}>
            <Button
              title="Giriş Yap"
              variant="outline"
              onPress={() => navigation.navigate('Login')}
              style={styles.authButton}
            />
            <Button
              title="Kayıt Ol"
              variant="primary"
              onPress={() => navigation.navigate('Register')}
              style={styles.authButton}
            />
          </View>
        )}
      </View>
    </View>
  );
});

StartScreen.displayName = 'StartScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  slide: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: SCREEN_HEIGHT * 0.15,
  },
  emojiContainer: {
    width: 160,
    height: 160,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  emoji: {
    fontSize: 80,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    height: 32,
  },
  dot: {
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  skipButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
  authButton: {
    flex: 1,
  },
});
