import { router } from 'expo-router';
import { View, Image, StyleSheet } from 'react-native';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/Button';
import { theme } from '@/components/ui/theme';
import { useAuthStore } from '@/core/auth/store/useAuthStore';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ui/ThemedText';

export function HeroSection() {
  const { authStatus } = useAuthStore();
  const { t } = useTranslation();

  return (
    <View style={styles.heroSection}>
      <View style={styles.topRow}>
        <View style={styles.badge}>
          <Ionicons name='shield-checkmark-outline' size={14} color={theme.primary} />
          <ThemedText style={styles.badgeText}>{t('secureAndPrivate')}</ThemedText>
        </View>

        {authStatus !== 'authenticated' && (
          <Button
            onPress={() => router.push('/login')}
            variant='outline'
            size='sm'
            style={styles.signInButton}
          >
            <ButtonText>{t('signIn')}</ButtonText>
            <ButtonIcon name='log-in-outline' size='sm' />
          </Button>
        )}
      </View>

      <View style={styles.heroCard}>
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logo}
          />
        </View>

        <ThemedText style={styles.title}>Ascencio Tax Inc.</ThemedText>
        <ThemedText style={styles.subtitle}>{t('servicesIntro')}</ThemedText>

        <View style={styles.ctaContainer}>
          {authStatus === 'authenticated' ? (
            <Button
              onPress={() => router.push('/(app)/(dashboard)')}
              fullWidth
              style={styles.primaryCta}
            >
              <ButtonText>{t('goToDashboard')}</ButtonText>
              <ButtonIcon name='arrow-forward-outline' />
            </Button>
          ) : (
            <Button
              onPress={() => router.push('/register')}
              fullWidth
              style={styles.primaryCta}
            >
              <ButtonText size='lg'>{t('startFreeTrial')}</ButtonText>
              <ButtonIcon name='arrow-forward-outline' />
            </Button>
          )}

          <Button
            variant='outline'
            fullWidth
            onPress={() => router.push('/(public)/services')}
            style={styles.secondaryCta}
          >
            <ButtonText>{t('services')}</ButtonText>
            <ButtonIcon name='briefcase-outline' />
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroSection: {
    paddingTop: 28,
    paddingBottom: 26,
    paddingHorizontal: 16,
  },
  topRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
    backgroundColor: theme.popover,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.primary,
  },
  signInButton: {
    marginVertical: 0,
  },
  heroCard: {
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
    backgroundColor: theme.card,
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'center',
    width: '100%',
  },
  logoContainer: {
    marginBottom: 12,
  },
  logo: {
    width: 260,
    height: 160,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: theme.foreground,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: theme.mutedForeground,
    textAlign: 'center',
    marginBottom: 14,
  },
  ctaContainer: {
    width: '100%',
    gap: 8,
  },
  primaryCta: {
    minHeight: 50,
  },
  secondaryCta: {
    minHeight: 46,
  },
});
