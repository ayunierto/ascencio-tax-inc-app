import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, View } from 'react-native';
import { useAuthStore } from '@/core/auth/store/useAuthStore';
import { theme } from '@/components/ui/theme';
import {
  HeroSection,
  FeaturesSection,
  QuickLinksSection,
  FooterSection,
} from '@/components/landing';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LandingPage() {
  const { checkAuthStatus } = useAuthStore();

  const insets = useSafeAreaInsets();
  const sectionAnimations = useRef(
    Array.from({ length: 4 }, () => new Animated.Value(0)),
  ).current;

  const animatedStyles = useMemo(
    () =>
      sectionAnimations.map((value) => ({
        opacity: value,
        transform: [
          {
            translateY: value.interpolate({
              inputRange: [0, 1],
              outputRange: [24, 0],
            }),
          },
          {
            scale: value.interpolate({
              inputRange: [0, 1],
              outputRange: [0.98, 1],
            }),
          },
        ],
      })),
    [sectionAnimations],
  );

  useEffect(() => {
    checkAuthStatus();

    const entranceAnimation = Animated.stagger(
      110,
      sectionAnimations.map((value) =>
        Animated.timing(value, {
          toValue: 1,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ),
    );

    entranceAnimation.start();
  }, [checkAuthStatus, sectionAnimations]);

  // useEffect(() => {
  //   if (authStatus === 'authenticated') {
  //     router.replace('/(app)/(tabs)/home');
  //   }
  // }, [authStatus]);

  return (
    <View
      style={[
        styles.page,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.backgroundOrbTop} pointerEvents='none' />
      <View style={styles.backgroundOrbBottom} pointerEvents='none' />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={animatedStyles[0]}>
          <HeroSection />
        </Animated.View>

        <Animated.View style={animatedStyles[1]}>
          <FeaturesSection />
        </Animated.View>

        <Animated.View style={animatedStyles[2]}>
          <QuickLinksSection />
        </Animated.View>

        <Animated.View style={animatedStyles[3]}>
          <FooterSection />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: theme.background,
    overflow: 'hidden',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 8,
  },
  backgroundOrbTop: {
    position: 'absolute',
    top: -120,
    right: -90,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#3b82f635',
  },
  backgroundOrbBottom: {
    position: 'absolute',
    bottom: -140,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#0ea5e933',
  },
});
