import { ScrollView, StyleSheet, View } from 'react-native';
import { useAuthStore } from '@/core/auth/store/useAuthStore';
import { useEffect } from 'react';
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

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // useEffect(() => {
  //   if (authStatus === 'authenticated') {
  //     router.replace('/(app)/(tabs)/home');
  //   }
  // }, [authStatus]);

  return (
    <View
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom, flex: 1 }}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <HeroSection />
        <FeaturesSection />
        <QuickLinksSection />
        <FooterSection />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
