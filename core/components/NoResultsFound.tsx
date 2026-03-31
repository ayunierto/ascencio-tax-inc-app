import { theme } from '@/components/ui';
import { ThemedText } from '@/components/ui/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

function NoResultsFound() {
  const { t } = useTranslation();

  return (
    <View style={{ padding: 20, alignItems: 'center' }}>
      <Ionicons name="search-outline" size={48} color={theme.muted} />
      <ThemedText style={{ marginTop: theme.gap, color: theme.muted }}>
        {t('noResultsFound')}
      </ThemedText>
    </View>
  );
}

export default NoResultsFound;
