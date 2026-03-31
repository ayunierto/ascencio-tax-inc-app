import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '../../components/ui';

export default function AboutScreen() {
  const { t } = useTranslation();

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.background },
      ]}
    >
      <Text style={[styles.title, { color: theme.foreground }]}>
        {t('aboutPageTitle')}
      </Text>

      <Text style={[styles.lead, { color: theme.foreground }]}>
        {t('aboutIntro')}
      </Text>

      <Image
        source={{
          uri: 'https://static.wixstatic.com/media/c837a6_2a112783570b4cd994206741c4e0a1b9~mv2.png',
        }}
        style={styles.heroImage}
        resizeMode='contain'
      />

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>
          {t('aboutChatAudioTitle')}
        </Text>
        <Text style={[styles.sectionText, { color: theme.foreground }]}>
          {t('aboutChatAudioDesc')}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>
          {t('aboutPersonalizedTitle')}
        </Text>
        <Text style={[styles.sectionText, { color: theme.foreground }]}>
          {t('aboutPersonalizedDesc')}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>
          {t('aboutWorkspaceTitle')}
        </Text>
        <Text style={[styles.sectionText, { color: theme.foreground }]}>
          {t('aboutWorkspaceDesc')}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.primary }]}>
          {t('aboutRealtimeTitle')}
        </Text>
        <Text style={[styles.sectionText, { color: theme.foreground }]}>
          {t('aboutRealtimeDesc')}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  lead: {
    fontSize: 16,
    marginBottom: 16,
  },
  heroImage: {
    width: '100%',
    height: 180,
    marginBottom: 18,
  },
  section: {
    width: '100%',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 20,
  },
  backLink: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
});
