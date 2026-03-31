import { router } from 'expo-router';
import { View, Image, StyleSheet } from 'react-native';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/Button';
import { theme } from '@/components/ui/theme';
import { useAuthStore } from '@/core/auth/store/useAuthStore';
import { useTranslation } from 'react-i18next';

export function HeroSection() {
  const { authStatus } = useAuthStore();
  const { t } = useTranslation();

  return (
    <View style={styles.heroSection}>
      <View style={styles.signInButtonContainer}>
        {authStatus !== 'authenticated' && (
          <Button onPress={() => router.push('/login')} variant="outline">
            <ButtonText>{t('signIn')}</ButtonText>
            <ButtonIcon name="log-in-outline" />
          </Button>
        )}
      </View>

      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
        />
      </View>

      <View style={styles.ctaContainer}>
        {authStatus === 'authenticated' ? (
          <Button onPress={() => router.push('/(app)/(dashboard)')}>
            <ButtonText>{t('goToDashboard')}</ButtonText>
            <ButtonIcon name="arrow-forward-outline" />
          </Button>
        ) : (
          <Button onPress={() => router.push('/register')}>
            <ButtonText size="lg">{t('startFreeTrial')}</ButtonText>
            <ButtonIcon name="arrow-forward-outline" />
          </Button>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroSection: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderRadius: 40,
    backgroundColor: theme.background,
  },
  signInButtonContainer: {
    width: '100%',
    alignItems: 'flex-end',
  },

  logoContainer: {
    marginBottom: 10,
  },
  logo: {
    width: 300,
    height: 200,
    resizeMode: 'contain',
  },
  ctaContainer: {
    width: '80%',
    maxWidth: 320,
    gap: 12,
  },
});
