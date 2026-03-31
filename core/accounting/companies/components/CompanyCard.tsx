import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Card, CardContent, theme } from '@/components/ui';
import { Company } from '@ascencio/shared';
import { ThemedText } from '@/components/ui/ThemedText';
import { Button, ButtonIcon } from '@/components/ui/Button';
import { DeleteConfirmationDialog } from '@/core/components';

interface CompanyCardProps {
  company: Company;
  isLoading: boolean;
  handleDelete: (companyId: string) => void;
}

export const CompanyCard = ({
  company,
  isLoading,
  handleDelete,
}: CompanyCardProps) => {
  const { t } = useTranslation();
  return (
    <TouchableOpacity
      onPress={() => router.push(`/(app)/companies/${company.id}`)}
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
              {company.name}
            </ThemedText>

            <ThemedText style={styles.subtitle} numberOfLines={1}>
              {company.legalName}
            </ThemedText>

            <ThemedText style={styles.subtitle}>
              {company.businessNumber}
            </ThemedText>
          </View>

          <DeleteConfirmationDialog onDelete={() => handleDelete(company.id)}>
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
