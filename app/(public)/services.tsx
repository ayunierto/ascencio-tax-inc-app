import React from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CustomHeader, HeaderButton, theme } from '../../components/ui';

interface ServiceSectionItem {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

export default function ServicesScreen() {
  const { t } = useTranslation();
  const clients = t('servicesClientsList', { returnObjects: true }) as string[];

  const serviceSections: ServiceSectionItem[] = [
    {
      key: 'business-registrations',
      icon: 'business-outline',
      title: t('servicesBusinessRegistrationsTitle'),
      description: t('servicesBusinessRegistrationsDesc'),
    },
    {
      key: 'reporting',
      icon: 'document-text-outline',
      title: t('servicesReportingTitle'),
      description: t('servicesReportingDesc'),
    },
    {
      key: 'benefits',
      icon: 'shield-checkmark-outline',
      title: t('servicesBenefitsTitle'),
      description: t('servicesBenefitsDesc'),
    },
  ];

  const openBooking = () => {
    router.push('/(app)/appointments/(tabs)/services');
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
        title={t('services')}
        left={
          <HeaderButton onPress={goBack}>
            <Ionicons name='arrow-back' size={22} color={theme.foreground} />
          </HeaderButton>
        }
        right={
          <HeaderButton onPress={openBooking}>
            <Ionicons name='calendar-outline' size={22} color={theme.primary} />
          </HeaderButton>
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.container,
          { backgroundColor: theme.background },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Ionicons name='sparkles-outline' size={14} color={theme.primary} />
            <Text style={[styles.heroBadgeText, { color: theme.primary }]}>
              Tax & Accounting
            </Text>
          </View>
          <Text style={[styles.title, { color: theme.foreground }]}>
            {t('servicesPageTitle')}
          </Text>
          <Text style={[styles.lead, { color: theme.mutedForeground }]}>
            {t('servicesIntro')}
          </Text>
        </View>

        {serviceSections.map((section) => (
          <View key={section.key} style={styles.card}>
            <View style={styles.cardTitleRow}>
              <View style={styles.cardIconWrap}>
                <Ionicons name={section.icon} size={18} color={theme.primary} />
              </View>
              <Text style={[styles.cardTitle, { color: theme.foreground }]}>
                {section.title}
              </Text>
            </View>
            <Text style={[styles.cardText, { color: theme.mutedForeground }]}>
              {section.description}
            </Text>
          </View>
        ))}

        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <View style={styles.cardIconWrap}>
              <Ionicons
                name='calculator-outline'
                size={18}
                color={theme.primary}
              />
            </View>
            <Text style={[styles.cardTitle, { color: theme.foreground }]}>
              {t('servicesIncomeTaxTitle')}
            </Text>
          </View>
          <Text style={[styles.cardText, { color: theme.mutedForeground }]}>
            {t('servicesIncomeTaxDesc')}
          </Text>
          <Text style={[styles.cardSubtitle, { color: theme.primary }]}>
            {t('servicesWeService')}
          </Text>
          <View style={styles.list}>
            {clients.map((item: string) => (
              <View key={item} style={styles.listItemRow}>
                <Ionicons
                  name='checkmark-circle'
                  size={14}
                  color={theme.primary}
                />
                <Text style={[styles.listItem, { color: theme.foreground }]}>
                  {item}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <Pressable
          style={styles.cta}
          onPress={openBooking}
          accessibilityRole='button'
        >
          <Ionicons
            name='calendar-outline'
            size={18}
            color={theme.primaryForeground}
          />
          <Text style={styles.ctaText}>{t('servicesCTA')}</Text>
        </Pressable>
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
    gap: 12,
  },
  heroCard: {
    width: '100%',
    padding: 16,
    borderRadius: 20,
    backgroundColor: theme.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.popover,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
    marginBottom: 10,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 6,
  },
  lead: {
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    backgroundColor: theme.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  cardIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.popover,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  cardText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 6,
    marginBottom: 6,
  },
  list: {
    marginTop: 2,
    gap: 6,
  },
  listItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  listItem: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  cta: {
    marginTop: 6,
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: theme.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaText: {
    color: theme.primaryForeground,
    fontSize: 15,
    fontWeight: '700',
  },
});
