import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Card, CardContent, theme } from '@/components/ui';
import { Employee } from '@ascencio/shared/interfaces';
import { ThemedText } from '@/components/ui/ThemedText';
import { Button, ButtonIcon } from '@/components/ui/Button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/AlertDialog';

interface EmployeeCardProps {
  employee: Employee;
  isLoading: boolean;
  handleDelete: (employeeId: string) => void;
}

export const EmployeeCard = ({
  employee,
  isLoading,
  handleDelete,
}: EmployeeCardProps) => {
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      // TODO: Create employees route structure under app/(app)/employees/[id]
      // onPress={() => router.push(`/(app)/employees/${employee.id}`)}
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
              {employee.firstName} {employee.lastName}
            </ThemedText>

            {employee.position && (
              <ThemedText style={styles.subtitle} numberOfLines={1}>
                {employee.position}
              </ThemedText>
            )}

            {employee.email && (
              <ThemedText style={styles.subtitle} numberOfLines={1}>
                {employee.email}
              </ThemedText>
            )}

            {employee.company && (
              <ThemedText style={styles.companyBadge} numberOfLines={1}>
                {employee.company.name}
              </ThemedText>
            )}
          </View>

          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                employee.isActive ? styles.activeBadge : styles.inactiveBadge,
              ]}
            >
              <ThemedText style={styles.statusText}>
                {employee.isActive ? t('active') : t('inactive')}
              </ThemedText>
            </View>
          </View>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                disabled={isLoading}
                isLoading={isLoading}
              >
                <ButtonIcon
                  name="trash-outline"
                  style={{ color: theme.destructive }}
                />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('areYouSure')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('thisActionCannotBeUndone')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                <AlertDialogAction onPress={() => handleDelete(employee.id)}>
                  {t('delete')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
    gap: 8,
  },
  subtitle: {
    color: theme.muted,
    fontSize: 12,
  },
  companyBadge: {
    color: theme.primary,
    fontSize: 11,
    marginTop: 4,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: theme.success + '20',
  },
  inactiveBadge: {
    backgroundColor: theme.muted + '20',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
});
