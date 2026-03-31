import React from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { theme } from '../../components/ui';

export default function ServicesScreen() {
  const { t } = useTranslation();
  const clients = t('servicesClientsList', { returnObjects: true }) as string[];

  const openBooking = () => {
    router.push('/services');
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.background },
      ]}
    >
      <Text style={[styles.title, { color: theme.foreground }]}>
        {t('servicesPageTitle')}
      </Text>
      <Text style={[styles.lead, { color: theme.foreground }]}>
        {t('servicesIntro')}
      </Text>

      <View style={styles.card}>
        <Text style={[styles.cardTitle, { color: theme.primary }]}>
          {t('servicesBusinessRegistrationsTitle')}
        </Text>
        <Text style={[styles.cardText, { color: theme.foreground }]}>
          {t('servicesBusinessRegistrationsDesc')}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={[styles.cardTitle, { color: theme.primary }]}>
          {t('servicesIncomeTaxTitle')}
        </Text>
        <Text style={[styles.cardText, { color: theme.foreground }]}>
          {t('servicesIncomeTaxDesc')}
        </Text>
        <Text style={[styles.cardSubtitle, { color: theme.foreground }]}>
          {t('servicesWeService')}
        </Text>
        <View style={styles.list}>
          {clients.map((item: string) => (
            <Text
              key={item}
              style={[styles.listItem, { color: theme.foreground }]}
            >
              • {item}
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={[styles.cardTitle, { color: theme.primary }]}>
          {t('servicesReportingTitle')}
        </Text>
        <Text style={[styles.cardText, { color: theme.foreground }]}>
          {t('servicesReportingDesc')}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={[styles.cardTitle, { color: theme.primary }]}>
          {t('servicesBenefitsTitle')}
        </Text>
        <Text style={[styles.cardText, { color: theme.foreground }]}>
          {t('servicesBenefitsDesc')}
        </Text>
      </View>

      <Pressable
        style={styles.cta}
        onPress={openBooking}
        accessibilityRole="button"
      >
        <Text style={{ color: theme.primaryForeground }}>
          {t('servicesCTA')}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 36,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  lead: {
    fontSize: 16,
    textAlign: 'center',
    maxWidth: 720,
    marginBottom: 18,
    color: '#fff',
  },
  card: {
    width: '100%',
    padding: 16,
    borderRadius: theme.radius,
    backgroundColor: theme.card,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardText: {
    fontSize: 14,
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 6,
    marginBottom: 6,
  },
  list: {
    marginLeft: 6,
  },
  listItem: {
    fontSize: 14,
    marginVertical: 2,
  },
  cta: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: theme.radius,
    backgroundColor: theme.primary,
  },
  backLink: {
    marginTop: 14,
    alignSelf: 'flex-start',
  },
});
