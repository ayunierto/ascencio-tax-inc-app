import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '../ui';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

export function FooterSection() {
  const { t } = useTranslation();

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
    Linking.openURL(url).catch((err) =>
      console.error('Failed to open email', err),
    );
  };

  return (
    <View style={styles.footer}>
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View style={styles.footerDivider} />

        <View
          style={{
            flexDirection: 'row',
            gap: theme.gap,
            alignItems: 'center',
            backgroundColor: 'black',
            paddingVertical: 4,
            paddingHorizontal: 18,
            borderRadius: theme.radius,
          }}
        >
          <Ionicons name='logo-apple' size={48} color={theme.foreground} />

          <View style={{ flexDirection: 'column' }}>
            <Text style={{ color: theme.foreground }}>
              {t('availableOnThe')}
            </Text>
            <Text
              style={{
                color: theme.foreground,
                fontSize: 16,
                fontWeight: '600',
              }}
            >
              {t('appStore')}
            </Text>
          </View>
        </View>
      </View>

      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          gap: theme.gap,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            gap: theme.gap,
            alignItems: 'center',
            backgroundColor: 'black',
            paddingVertical: 4,
            paddingHorizontal: 18,
            borderRadius: theme.radius,
          }}
        >
          <Ionicons name='logo-google-playstore' size={48} color='white' />

          <View style={{ flexDirection: 'column' }}>
            <Text style={{ color: theme.foreground }}>
              {t('availableOnThe')}
            </Text>
            <Text
              style={{
                color: theme.foreground,
                fontSize: 16,
                fontWeight: '600',
              }}
            >
              {t('googlePlay')}
            </Text>
          </View>
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          gap: theme.gap,
          justifyContent: 'center',
        }}
      >
        <Link href='https://www.facebook.com/ascenciotax' target='_blank'>
          <Ionicons name='logo-facebook' size={30} color={theme.foreground} />
        </Link>
        <Link href='https://twitter.com/ascenciotax' target='_blank'>
          <Ionicons name='logo-twitter' size={30} color={theme.foreground} />
        </Link>
        <Link href='https://www.instagram.com/ascenciotax/' target='_blank'>
          <Ionicons name='logo-instagram' size={30} color={theme.foreground} />
        </Link>
      </View>

      <View style={{ paddingHorizontal: 24, paddingVertical: 10, gap: 8 }}>
        <Pressable
          accessibilityRole='link'
          onPress={() =>
            openMaps('1219 St Clair Ave West Suite G15, Toronto, ON M6E 1B5')
          }
          style={{ alignItems: 'center' }}
        >
          <Text
            style={{
              color: theme.foreground,
              textAlign: 'center',
              textDecorationLine: 'underline',
            }}
          >
            1219 St Clair Ave West Suite G15, Toronto, ON M6E 1B5
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole='link'
          onPress={() => openEmail('ascenciotaxinc@gmail.com')}
          style={{ alignItems: 'center' }}
        >
          <Text
            style={{
              color: theme.foreground,
              textAlign: 'center',
              textDecorationLine: 'underline',
            }}
          >
            ascenciotaxinc@gmail.com
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole='button'
          onPress={() => openPhone('(416) 658-1208')}
          style={{ alignItems: 'center' }}
        >
          <Text
            style={{
              color: theme.foreground,
              textAlign: 'center',
              textDecorationLine: 'underline',
            }}
          >
            (416) 658-1208
          </Text>
        </Pressable>
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
    paddingTop: 48,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: theme.primary,
    gap: 12,
  },
  footerDivider: {
    height: 1,
    backgroundColor: theme.primary,
    marginVertical: 16,
  },

  footerCopyright: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
  },
});
