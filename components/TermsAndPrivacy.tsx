import React from 'react';
import { Linking, StyleSheet } from 'react-native';
import { ThemedText } from './ui/ThemedText';
import { theme } from './ui/theme';
import { useTranslation } from 'react-i18next';

const TermsAndPrivacy = () => {
  const { t } = useTranslation();

  return (
    <ThemedText>
      {t('bySigningUpYouAgreeToOur')}{' '}
      <ThemedText
        style={styles.link}
        onPress={() =>
          Linking.openURL('https://www.ascenciotax.com/termsofuse')
        }
      >
        {t('termsOfService')}
      </ThemedText>{' '}
      {t('and')}{' '}
      <ThemedText
        style={styles.link}
        onPress={() => Linking.openURL('https://www.ascenciotax.com/privacy')}
      >
        {t('privacyPolicy')}
      </ThemedText>
    </ThemedText>
  );
};

const styles = StyleSheet.create({
  link: {
    color: theme.primary,
    textDecorationLine: 'underline',
  },
});

export default TermsAndPrivacy;
