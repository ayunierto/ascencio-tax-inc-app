import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Linking,
  ScrollView,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { CustomHeader, HeaderButton, theme } from '../../components/ui';

export default function ContactScreen() {
  const { t } = useTranslation();

  const address = '1219 St Clair Ave West Suite G15, Toronto, ON M6E 1B5';
  const phone = '(416) 658 1208';
  const email = 'ascenciotaxinc@gmail.com';
  const contactPageUrl = 'https://www.ascenciotax.com/contact-us';

  const staff = [
    {
      name: 'Lucy Ascencio',
      role: 'Tax Associates',
      image:
        'https://static.wixstatic.com/media/aa0f39_4a2ce08d9cd746b69b5c9f1aabd5aced~mv2.jpg',
      facebook: 'https://www.facebook.com/ascenciotaxinc',
      instagram: 'https://www.instagram.com/ascenciotax/',
      whatsapp: '+14166581208',
    },
    {
      name: 'Yulier Rondon',
      role: 'Tax Associates',
      image:
        'https://static.wixstatic.com/media/aa0f39_97050a158da5419ebf9284baa30a4ec9~mv2.jpg',
      facebook: 'https://www.facebook.com/ascenciotaxinc',
      instagram: 'https://www.instagram.com/ascenciotax/',
      whatsapp: '+14166581208',
    },
    {
      name: 'Andrea Velasquez Ochoa',
      role: 'Administrative Assistant',
      image:
        'https://static.wixstatic.com/media/5b9531_93df9e8ed20f46bd97ceba5166d91d9d~mv2.jpeg',
      facebook: 'https://www.facebook.com/ascenciotaxinc',
      instagram: 'https://www.instagram.com/ascenciotax/',
      whatsapp: '+14166581208',
    },
  ];

  const openWhatsApp = (phoneNumber: string) => {
    const digits = phoneNumber.replace(/\D/g, '');
    const url = `https://wa.me/${digits}`;
    Linking.openURL(url).catch((err) =>
      console.error('Failed to open WhatsApp', err),
    );
  };

  const openMaps = (addr: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      addr,
    )}`;
    Linking.openURL(url).catch((err) =>
      console.error('Failed to open maps', err),
    );
  };

  const openPhone = (p: string) => {
    const digits = p.replace(/\D/g, '');
    const url = `tel:${digits}`;
    Linking.openURL(url).catch((err) =>
      console.error('Failed to open dialer', err),
    );
  };

  const openEmail = (e: string) => {
    const url = `mailto:${e}`;
    Linking.openURL(url).catch((err) =>
      console.error('Failed to open email', err),
    );
  };

  const openUrl = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error('Failed to open url', err),
    );
  };

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/');
  };

  return (
    <View style={styles.page}>
      <CustomHeader
        title={t('contact')}
        left={
          <HeaderButton onPress={goBack}>
            <Ionicons name='arrow-back' size={22} color={theme.foreground} />
          </HeaderButton>
        }
        right={
          <HeaderButton onPress={() => openUrl(contactPageUrl)}>
            <Ionicons name='open-outline' size={22} color={theme.primary} />
          </HeaderButton>
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <Text style={[styles.heroTitle, { color: theme.foreground }]}>
            {t('letsChat')}
          </Text>
          <Text style={[styles.description, { color: theme.muted }]}>
            {t('contactPageSubtitle')}
          </Text>

          <View style={styles.quickActionsGrid}>
            <Pressable
              onPress={() => openPhone(phone)}
              style={styles.quickAction}
              accessibilityRole='button'
            >
              <Ionicons name='call-outline' size={18} color={theme.primary} />
              <Text
                style={[styles.quickActionText, { color: theme.foreground }]}
              >
                Call
              </Text>
            </Pressable>

            <Pressable
              onPress={() => openEmail(email)}
              style={styles.quickAction}
              accessibilityRole='button'
            >
              <Ionicons name='mail-outline' size={18} color={theme.primary} />
              <Text
                style={[styles.quickActionText, { color: theme.foreground }]}
              >
                Email
              </Text>
            </Pressable>

            <Pressable
              onPress={() => openWhatsApp('+14166581208')}
              style={styles.quickAction}
              accessibilityRole='button'
            >
              <Ionicons name='logo-whatsapp' size={18} color={theme.primary} />
              <Text
                style={[styles.quickActionText, { color: theme.foreground }]}
              >
                WhatsApp
              </Text>
            </Pressable>

            <Pressable
              onPress={() => openMaps(address)}
              style={styles.quickAction}
              accessibilityRole='button'
            >
              <Ionicons
                name='navigate-outline'
                size={18}
                color={theme.primary}
              />
              <Text
                style={[styles.quickActionText, { color: theme.foreground }]}
              >
                Mapa
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Pressable onPress={() => openPhone(phone)} style={styles.row}>
            <Ionicons name='call' size={20} color={theme.foreground} />
            <Text style={[styles.rowText, { color: theme.foreground }]}>
              {phone}
            </Text>
          </Pressable>

          <Pressable onPress={() => openEmail(email)} style={styles.row}>
            <Ionicons name='mail' size={20} color={theme.foreground} />
            <Text style={[styles.rowText, { color: theme.foreground }]}>
              {email}
            </Text>
          </Pressable>

          <Pressable onPress={() => openMaps(address)} style={styles.row}>
            <Ionicons name='location' size={20} color={theme.foreground} />
            <Text style={[styles.rowText, { color: theme.foreground }]}>
              {address}
            </Text>
          </Pressable>

          <View style={styles.socialRow}>
            <Pressable
              onPress={() => openUrl('https://www.facebook.com/ascenciotaxinc')}
              style={styles.socialButton}
              accessibilityRole='button'
            >
              <Ionicons
                name='logo-facebook'
                size={20}
                color={theme.foreground}
              />
            </Pressable>
            <Pressable
              onPress={() => openUrl('https://www.instagram.com/ascenciotax/')}
              style={styles.socialButton}
              accessibilityRole='button'
            >
              <Ionicons
                name='logo-instagram'
                size={20}
                color={theme.foreground}
              />
            </Pressable>
            <Pressable
              onPress={() => openUrl('https://wa.me/14166581208')}
              style={styles.socialButton}
              accessibilityRole='button'
            >
              <Ionicons
                name='logo-whatsapp'
                size={20}
                color={theme.foreground}
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.teamContainer}>
          <Text style={[styles.sectionTitle, { color: theme.primary }]}>
            {t('ourTeam')}
          </Text>

          {staff.map((m) => (
            <View key={m.name} style={styles.memberCard}>
              <Image source={{ uri: m.image }} style={styles.memberImage} />
              <View style={styles.memberContent}>
                <Text style={[styles.memberName, { color: theme.foreground }]}>
                  {m.name}
                </Text>
                <Text style={[styles.memberRole, { color: theme.muted }]}>
                  {m.role}
                </Text>
                <View style={styles.memberActions}>
                  <Pressable
                    onPress={() => openUrl(m.facebook)}
                    style={styles.memberIconButton}
                  >
                    <Ionicons
                      name='logo-facebook'
                      size={18}
                      color={theme.foreground}
                    />
                  </Pressable>
                  <Pressable
                    onPress={() => openUrl(m.instagram)}
                    style={styles.memberIconButton}
                  >
                    <Ionicons
                      name='logo-instagram'
                      size={18}
                      color={theme.foreground}
                    />
                  </Pressable>
                  <Pressable
                    onPress={() => openWhatsApp(m.whatsapp)}
                    style={styles.memberIconButton}
                  >
                    <Ionicons
                      name='logo-whatsapp'
                      size={18}
                      color={theme.foreground}
                    />
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scroll: {
    flex: 1,
    backgroundColor: theme.background,
  },
  container: {
    padding: 16,
    gap: 14,
  },
  heroCard: {
    padding: 18,
    borderRadius: theme.radius,
    backgroundColor: theme.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickAction: {
    width: '48%',
    minHeight: 44,
    borderRadius: theme.radius,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
    backgroundColor: theme.popover,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    width: '100%',
    padding: 16,
    borderRadius: theme.radius,
    backgroundColor: theme.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  teamContainer: {
    width: '100%',
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  rowText: {
    flex: 1,
    fontSize: 15,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  socialButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.popover,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
  },
  memberCard: {
    width: '100%',
    padding: 12,
    borderRadius: theme.radius,
    backgroundColor: theme.popover,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
    flexDirection: 'row',
    gap: 12,
  },
  memberImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  memberContent: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '700',
  },
  memberRole: {
    fontSize: 13,
    marginTop: 2,
    marginBottom: 10,
  },
  memberActions: {
    flexDirection: 'row',
    gap: 8,
  },
  memberIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
  },
});
