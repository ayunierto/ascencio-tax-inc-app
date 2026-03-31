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
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../components/ui';

export default function ContactScreen() {
  const { t } = useTranslation();

  const address = '1219 St Clair Ave West Suite G15, Toronto, ON M6E 1B5';
  const phone = '(416) 658-1208';
  const email = 'ascenciotaxinc@gmail.com';

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
      name: 'Luciana Vega Villarreal',
      role: 'Administrative Assistant',
      image:
        'https://static.wixstatic.com/media/5b9531_0f3807d717364c16b70e225399d95563~mv2.jpg',
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

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.background },
      ]}
    >
      <Text style={[styles.description, { color: theme.foreground }]}>
        {t('contactPageSubtitle')}
      </Text>

      <View style={styles.card}>
        <Text style={[styles.cardTitle, { color: theme.primary }]}>
          {t('letsChat')}
        </Text>

        <Pressable
          onPress={() => openPhone(phone)}
          style={styles.row}
          accessibilityRole="button"
        >
          <Ionicons name="call" size={20} color={theme.foreground} />
          <Text style={[styles.rowText, { color: theme.foreground }]}>
            {phone}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => openEmail(email)}
          style={styles.row}
          accessibilityRole="link"
        >
          <Ionicons name="mail" size={20} color={theme.foreground} />
          <Text style={[styles.rowText, { color: theme.foreground }]}>
            {email}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => openMaps(address)}
          style={styles.row}
          accessibilityRole="link"
        >
          <Ionicons name="location" size={20} color={theme.foreground} />
          <Text style={[styles.rowText, { color: theme.foreground }]}>
            {address}
          </Text>
        </Pressable>

        <View style={styles.socialRow}>
          <Link href="https://www.facebook.com/ascenciotaxinc" target="_blank">
            <Ionicons name="logo-facebook" size={26} color={theme.foreground} />
          </Link>
          <Link href="https://www.instagram.com/ascenciotax/" target="_blank">
            <Ionicons
              name="logo-instagram"
              size={26}
              color={theme.foreground}
            />
          </Link>
          <Link href="https://twitter.com/ascenciotax" target="_blank">
            <Ionicons name="logo-twitter" size={26} color={theme.foreground} />
          </Link>
        </View>
      </View>

      {/* Team members */}
      <View style={styles.teamContainer}>
        <Text
          style={[styles.cardTitle, { color: theme.primary, width: '100%' }]}
        >
          {t('ourTeam')}
        </Text>
        <View style={styles.teamGrid}>
          {staff.map((m) => (
            <View key={m.name} style={styles.memberCard}>
              <Image source={{ uri: m.image }} style={styles.memberImage} />
              <Text style={[styles.memberName, { color: theme.foreground }]}>
                {m.name}
              </Text>
              <Text style={[styles.memberRole, { color: theme.muted }]}>
                {m.role}
              </Text>
              <View style={styles.memberActions}>
                <Pressable onPress={() => Linking.openURL(m.facebook)}>
                  <Ionicons
                    name="logo-facebook"
                    size={20}
                    color={theme.foreground}
                  />
                </Pressable>
                <Pressable onPress={() => Linking.openURL(m.instagram)}>
                  <Ionicons
                    name="logo-instagram"
                    size={20}
                    color={theme.foreground}
                  />
                </Pressable>
                <Pressable onPress={() => openWhatsApp(m.whatsapp)}>
                  <Ionicons
                    name="logo-whatsapp"
                    size={20}
                    color={theme.foreground}
                  />
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    maxWidth: 680,
  },
  card: {
    width: '100%',
    padding: 18,
    borderRadius: theme.radius,
    backgroundColor: theme.card,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  rowText: {
    marginLeft: 8,
    fontSize: 16,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 18,
    marginTop: 12,
  },
  backLink: {
    marginTop: 8,
  },
  teamContainer: {
    width: '100%',
    marginTop: 8,
  },
  teamGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  memberCard: {
    width: '48%',
    padding: 12,
    borderRadius: theme.radius,
    backgroundColor: theme.popover,
    alignItems: 'center',
    marginBottom: 12,
  },
  memberImage: {
    width: 96,
    height: 96,
    borderRadius: 96,
    marginBottom: 8,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '700',
  },
  memberRole: {
    fontSize: 13,
    marginBottom: 8,
  },
  memberActions: {
    flexDirection: 'row',
    gap: 12,
  },
});
