import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../components/ui';

interface ValueItem {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

export default function AboutScreen() {
  const { t } = useTranslation();

  const values: ValueItem[] = [
    {
      key: 'chat-audio',
      icon: 'chatbubble-ellipses-outline',
      title: t('aboutChatAudioTitle'),
      description: t('aboutChatAudioDesc'),
    },
    {
      key: 'personalized',
      icon: 'sparkles-outline',
      title: t('aboutPersonalizedTitle'),
      description: t('aboutPersonalizedDesc'),
    },
    {
      key: 'workspace',
      icon: 'briefcase-outline',
      title: t('aboutWorkspaceTitle'),
      description: t('aboutWorkspaceDesc'),
    },
    {
      key: 'realtime',
      icon: 'flash-outline',
      title: t('aboutRealtimeTitle'),
      description: t('aboutRealtimeDesc'),
    },
  ];

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.background },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroCard}>
        <View style={styles.heroBadge}>
          <Ionicons name='people-outline' size={14} color={theme.primary} />
          <Text style={[styles.heroBadgeText, { color: theme.primary }]}>
            Ascencio Tax
          </Text>
        </View>
        <Text style={[styles.title, { color: theme.foreground }]}>
          {t('aboutPageTitle')}
        </Text>

        <Text style={[styles.lead, { color: theme.mutedForeground }]}>
          {t('aboutIntro')}
        </Text>

        <Image
          source={{
            uri: 'https://static.wixstatic.com/media/c837a6_2a112783570b4cd994206741c4e0a1b9~mv2.png',
          }}
          style={styles.heroImage}
          resizeMode='cover'
        />
      </View>

      <View style={styles.valuesContainer}>
        {values.map((value) => (
          <View key={value.key} style={styles.valueCard}>
            <View style={styles.valueIconWrap}>
              <Ionicons name={value.icon} size={18} color={theme.primary} />
            </View>
            <View style={styles.valueContent}>
              <Text style={[styles.sectionTitle, { color: theme.foreground }]}>
                {value.title}
              </Text>
              <Text
                style={[styles.sectionText, { color: theme.mutedForeground }]}
              >
                {value.description}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: theme.background,
  },
  container: {
    padding: 16,
    gap: 14,
  },
  heroCard: {
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
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  lead: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 14,
  },
  heroImage: {
    width: '100%',
    height: 200,
    borderRadius: 14,
  },
  valuesContainer: {
    width: '100%',
    gap: 10,
  },
  valueCard: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: theme.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  valueIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.popover,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
  },
  valueContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
