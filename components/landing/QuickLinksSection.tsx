import { router } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/Button';
import { useTranslation } from 'react-i18next';

export function QuickLinksSection() {
  const { t } = useTranslation();

  const QUICK_LINKS = [
    {
      icon: 'star-outline' as const,
      text: t('services'),
      route: '/(public)/services' as const,
    },
    {
      icon: 'information-circle-outline' as const,
      text: t('aboutUs'),
      route: '/(public)/about' as const,
    },
    {
      icon: 'mail-outline' as const,
      text: t('contact'),
      route: '/(public)/contact' as const,
    },
  ];

  return (
    <View style={styles.linksSection}>
      <ThemedText style={styles.linksSectionTitle}>{t('learnMore')}</ThemedText>

      <View style={styles.linksContainer}>
        {QUICK_LINKS.map((link) => (
          <Button
            key={link.text}
            variant="outline"
            onPress={() => router.push(link.route)}
          >
            <ButtonIcon name={link.icon} />
            <ButtonText>{link.text}</ButtonText>
          </Button>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  linksSection: {
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  linksSectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 16,
  },
});
