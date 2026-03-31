import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Card, CardContent, theme } from '@/components/ui';
import { Client } from '@ascencio/shared';
import { ThemedText } from '@/components/ui/ThemedText';
import { Button, ButtonIcon } from '@/components/ui/Button';
import { DeleteConfirmationDialog } from '@/core/components';

interface ClientCardProps {
  client: Client;
  isLoading: boolean;
  handleDelete: (clientId: string) => void;
}

export const ClientCard = ({
  client,
  isLoading,
  handleDelete,
}: ClientCardProps) => {
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      onPress={() => router.push(`/(app)/clients/${client.id}`)}
      disabled={isLoading}
      activeOpacity={0.7}
    >
      <Card>
        <CardContent style={styles.cardContent}>
          <View style={{ flex: 1 }}>
            <ThemedText
              numberOfLines={1}
              style={{ fontWeight: 'bold', marginBottom: 4 }}
            >
              {client.fullName}
            </ThemedText>

            <ThemedText style={styles.subtitle} numberOfLines={1}>
              {client.email}
            </ThemedText>

            <ThemedText style={styles.subtitle}>{client.phone}</ThemedText>
          </View>

          <DeleteConfirmationDialog onDelete={() => handleDelete(client.id)}>
            <Button variant="ghost" disabled={isLoading} isLoading={isLoading}>
              <ButtonIcon
                name="trash-outline"
                style={{ color: theme.destructive }}
              />
            </Button>
          </DeleteConfirmationDialog>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtitle: { color: theme.muted, fontSize: 12 },
});
