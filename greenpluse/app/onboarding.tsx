import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
  StyleSheet,
  ListRenderItemInfo,
  ViewToken
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Zap, Leaf, Coins } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';

type Slide = {
  key: string;
  title: string;
  description: string;
  highlight: string;
  Icon: typeof Zap;
};

const SLIDES: Slide[] = [
  {
    key: 'track-energy',
    title: 'Understand Your Usage',
    description: 'Upload utility bills in seconds and watch GreenPulse turn raw numbers into insights that matter.',
    highlight: 'Track every kilowatt-hour with clarity.',
    Icon: Zap
  },
  {
    key: 'support-projects',
    title: 'Power Local Projects',
    description: 'Discover vetted renewable initiatives that transform communities through clean energy.',
    highlight: 'Fund the change you want to see.',
    Icon: Leaf
  },
  {
    key: 'earn-rewards',
    title: 'Grow Your Impact',
    description: 'Collect GreenPulse coins, unlock badges, and celebrate the carbon savings you generate.',
    highlight: 'Your journey to greener living starts now.',
    Icon: Coins
  }
];

const { width } = Dimensions.get('window');

const OnboardingScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const listRef = useRef<FlatList<Slide>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completing, setCompleting] = useState(false);

  const finishRoute = user ? '/(root)/(MainTabs)' : '/signIn';

  const completeOnboarding = useCallback(async () => {
    if (completing) return;

    try {
      setCompleting(true);
      await AsyncStorage.setItem('hasOnboarded', 'true');
      router.replace(finishRoute);
    } catch (error) {
      setCompleting(false);
    }
  }, [completing, finishRoute, router]);

  const handleNext = useCallback(() => {
    if (currentIndex < SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      listRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      completeOnboarding();
    }
  }, [completeOnboarding, currentIndex]);

  const handleSkip = useCallback(() => {
    completeOnboarding();
  }, [completeOnboarding]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken<Slide>[] }) => {
      const firstItem = viewableItems[0];
      if (firstItem?.index !== null && firstItem?.index !== undefined) {
        setCurrentIndex(firstItem.index);
      }
    }
  ).current;

  const viewabilityConfig = useMemo(
    () => ({ viewAreaCoveragePercentThreshold: 60 }),
    []
  );

  const renderItem = useCallback(({ item }: ListRenderItemInfo<Slide>) => {
    const Icon = item.Icon;

    return (
      <View style={[styles.slideContainer, { width }]}> 
        <View style={styles.cardSurface}>
          <View style={styles.iconBadge}>
            <Icon size={42} color="#1AE57D" />
          </View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
          <View style={styles.highlightContainer}>
            <Text style={styles.highlightText}>{item.highlight}</Text>
          </View>
        </View>
      </View>
    );
  }, []);

  const getItemLayout = useCallback(
    (_: ArrayLike<Slide> | null | undefined, index: number) => ({
      length: width,
      offset: width * index,
      index
    }),
    []
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <Text style={styles.brand}>GreenPulse</Text>
        <TouchableOpacity onPress={handleSkip} disabled={completing}>
          <Text style={styles.skipLabel}>Skip</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={getItemLayout}
      />

      <View style={styles.footer}>
        <View style={styles.dotsRow}>
          {SLIDES.map((slide, index) => (
            <View
              key={slide.key}
              style={[
                styles.dot,
                index === currentIndex ? styles.dotActive : styles.dotInactive
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          onPress={handleNext}
          style={styles.primaryButton}
          disabled={completing}
        >
          <Text style={styles.primaryButtonText}>
            {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSkip} disabled={completing}>
          <Text style={styles.secondaryAction}>I’ll explore later</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B1712',
    paddingBottom: 24
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12
  },
  brand: {
    color: '#1AE57D',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.8
  },
  skipLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600'
  },
  slideContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 36,
    alignItems: 'center'
  },
  cardSurface: {
    flex: 1,
    backgroundColor: '#142920',
    borderRadius: 28,
    padding: 28,
    justifyContent: 'center',
    shadowColor: '#1AE57D',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: 6
  },
  iconBadge: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#0E2118',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#1AE57D30'
  },
  title: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 18
  },
  description: {
    color: '#D1D5DB',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 28
  },
  highlightContainer: {
    backgroundColor: '#1AE57D15',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#1AE57D40'
  },
  highlightText: {
    color: '#1AE57D',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    fontWeight: '600'
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 16
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5
  },
  dotInactive: {
    backgroundColor: '#1AE57D30'
  },
  dotActive: {
    backgroundColor: '#1AE57D'
  },
  primaryButton: {
    backgroundColor: '#1AE57D',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center'
  },
  primaryButtonText: {
    color: '#0B1712',
    fontSize: 16,
    fontWeight: '700'
  },
  secondaryAction: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center'
  }
});

export default OnboardingScreen;