import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '../ui';
import { Ionicons } from '@expo/vector-icons';

export function FooterSection() {
  const { t } = useTranslation();
  const contactAddress =
    '1219 St Clair Ave West Suite G15, Toronto, ON M6E 1B5';
  const contactEmail = 'ascenciotaxinc@gmail.com';
  const contactPhone = '(416) 658 1208';
  const contactPageUrl = 'https://www.ascenciotax.com/contact-us';

  const openUrl = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error('Failed to open url', err),
    );
  };

  const openMaps = (address: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address,
    )}`;
    Linking.openURL(url).catch((err) =>
      console.error('Failed to open maps', err),
    );
  };

  const openPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    const url = `tel:${digits}`;
    Linking.openURL(url).catch((err) =>
      console.error('Failed to open dialer', err),
    );
  };

  const openEmail = (email: string) => {
    const url = `mailto:${email}`;
    openUrl(url);
  };

  return (
    <View style={styles.footer}>
      <View style={styles.footerCard}>
        <Text style={styles.footerTitle}>Ascencio Tax Inc.</Text>
        <Text style={styles.footerSubtitle}>{t('contactPageSubtitle')}</Text>

        <View style={styles.socialRow}>
          <Pressable
            style={styles.socialButton}
            onPress={() => openUrl('https://www.facebook.com/ascenciotaxinc')}
            accessibilityRole='button'
          >
            <Ionicons name='logo-facebook' size={18} color={theme.foreground} />
          </Pressable>
          <Pressable
            style={styles.socialButton}
            onPress={() => openUrl('https://www.instagram.com/ascenciotax/')}
            accessibilityRole='button'
          >
            <Ionicons
              name='logo-instagram'
              size={18}
              color={theme.foreground}
            />
          </Pressable>
          <Pressable
            style={styles.socialButton}
            onPress={() => openUrl(contactPageUrl)}
            accessibilityRole='button'
          >
            <Ionicons name='open-outline' size={18} color={theme.foreground} />
          </Pressable>
        </View>

        <View style={styles.infoList}>
          <Pressable
            accessibilityRole='link'
            onPress={() => openMaps(contactAddress)}
            style={styles.infoRow}
          >
            <Ionicons name='location-outline' size={16} color={theme.primary} />
            <Text style={styles.infoText}>{contactAddress}</Text>
          </Pressable>

          <Pressable
            accessibilityRole='link'
            onPress={() => openEmail(contactEmail)}
            style={styles.infoRow}
          >
            <Ionicons name='mail-outline' size={16} color={theme.primary} />
            <Text style={styles.infoText}>{contactEmail}</Text>
          </Pressable>

          <Pressable
            accessibilityRole='button'
            onPress={() => openPhone(contactPhone)}
            style={styles.infoRow}
          >
            <Ionicons name='call-outline' size={16} color={theme.primary} />
            <Text style={styles.infoText}>{contactPhone}</Text>
          </Pressable>

          <Pressable
            accessibilityRole='link'
            onPress={() => openUrl(contactPageUrl)}
            style={styles.infoRow}
          >
            <Ionicons name='globe-outline' size={16} color={theme.primary} />
            <Text style={styles.infoText}>{contactPageUrl}</Text>
          </Pressable>
        </View>
      </View>

      <View>
        <View style={styles.footerDivider} />
        <Text style={styles.footerCopyright}>
          © {new Date().getFullYear()} Ascencio Tax Inc.{' '}
          {t('allRightsReserved')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingTop: 10,
    paddingBottom: 28,
    paddingHorizontal: 16,
    gap: 10,
  },
  footerCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
    backgroundColor: theme.card,
    padding: 14,
  },
  footerTitle: {
    color: theme.foreground,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  footerSubtitle: {
    color: theme.mutedForeground,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  socialButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.popover,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
  },
  infoList: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  infoText: {
    color: theme.foreground,
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  footerDivider: {
    height: 1,
    backgroundColor: theme.border,
    marginVertical: 10,
  },

  footerCopyright: {
    fontSize: 12,
    color: theme.mutedForeground,
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
  },
});
