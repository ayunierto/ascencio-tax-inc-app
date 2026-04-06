import { router } from 'expo-router';
import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/components/ui/theme';

export function QuickLinksSection() {
  const { t } = useTranslation();

  const QUICK_LINKS = [
    {
      icon: 'star-outline' as const,
      text: t('services'),
      route: '/(public)/services' as const,
      color: '#f59e0b',
    },
    {
      icon: 'information-circle-outline' as const,
      text: t('aboutUs'),
      route: '/(public)/about' as const,
      color: '#3b82f6',
    },
    {
      icon: 'mail-outline' as const,
      text: t('contact'),
      route: '/(public)/contact' as const,
      color: '#10b981',
    },
  ];

  return (
    <View style={styles.linksSection}>
      <ThemedText style={styles.linksSectionTitle}>{t('learnMore')}</ThemedText>

      <View style={styles.linksContainer}>
        {QUICK_LINKS.map((link) => (
          <Pressable
            key={link.text}
            onPress={() => router.push(link.route)}
            style={styles.linkCard}
            accessibilityRole='button'
          >
            <View style={styles.linkCardLeft}>
              <View
                style={[
                  styles.linkCardIconWrap,
                  { backgroundColor: `${link.color}20` },
                ]}
              >
                <Ionicons name={link.icon} size={18} color={link.color} />
              </View>

              <View style={styles.linkCardTextWrap}>
                <ThemedText style={styles.linkTitle}>{link.text}</ThemedText>
              </View>
            </View>

            <Ionicons
              name='chevron-forward-outline'
              size={18}
              color={theme.mutedForeground}
            />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  linksSection: {
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  linksSectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'left',
  },
  linksContainer: {
    gap: 10,
  },
  linkCard: {
    width: '100%',
    minHeight: 60,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
    backgroundColor: theme.card,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  linkCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  linkCardIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkCardTextWrap: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
});
