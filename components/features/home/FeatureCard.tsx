import { ThemedText } from '@/components/themed-text';
import { Card, theme } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) {
  return (
    <Card style={styles.featureCard}>
      <View style={styles.featureIconContainer}>
        <Ionicons name={icon} size={32} color={theme.primary} />
      </View>
      <ThemedText style={styles.featureTitle}>{title}</ThemedText>
      <ThemedText style={styles.featureDescription}>{description}</ThemedText>
    </Card>
  );
}

export default FeatureCard;

const styles = StyleSheet.create({
  featureCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  featureIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 14,
    color: theme.mutedForeground,
    textAlign: 'center',
    lineHeight: 20,
  },
});
