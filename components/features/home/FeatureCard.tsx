import { ThemedText } from '@/components/themed-text';
import { Card, theme } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}) {
  return (
    <Card style={styles.featureCard}>
      <View style={styles.featureIconContainer}>
        <Ionicons name={icon} size={22} color={theme.primary} />
      </View>

      <View style={styles.featureContent}>
        <ThemedText style={styles.featureTitle}>{title}</ThemedText>
        <ThemedText style={styles.featureDescription}>{description}</ThemedText>
      </View>
    </Card>
  );
}

export default FeatureCard;

const styles = StyleSheet.create({
  featureCard: {
    width: '100%',
    minHeight: 116,
    padding: 14,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.border,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: theme.mutedForeground,
    lineHeight: 19,
  },
});
