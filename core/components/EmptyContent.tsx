import { Button, ButtonText } from '@/components/ui/Button';
import { theme } from '@/components/ui/theme';
import { ThemedText } from '@/components/ui/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';

interface EmptyContentProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  /**
   * @deprecated Use action instead, user action for custom actions
   */
  onRetry?: () => void;
  action?: React.ReactNode;
}

export const EmptyContent = ({
  title,
  subtitle = '',
  icon,
  onRetry,
  action,
}: EmptyContentProps) => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        gap: 6,
      }}
    >
      <Ionicons
        name={icon ? icon : 'information-circle-outline'}
        size={48}
        color={theme.foreground}
      />
      <ThemedText style={{ fontSize: 16 }}>{title}</ThemedText>
      <ThemedText style={{ color: theme.muted, fontSize: 14 }}>
        {subtitle}
      </ThemedText>

      {onRetry && (
        <Button onPress={onRetry} size="sm">
          <ButtonText>Try again</ButtonText>
        </Button>
      )}

      {action && action}
    </View>
  );
};
