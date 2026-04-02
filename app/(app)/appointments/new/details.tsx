import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  View,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';

import { BookingProgressStepper } from '@/components/booking/BookingProgressStepper';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/Button';
import { theme } from '@/components/ui/theme';
import { ThemedText } from '@/components/themed-text';
import { EmptyContent } from '@/core/components';
import { useBookingStore } from '@/core/services/store/useBookingStore';
import { toast } from 'sonner-native';

const detailsSchema = z.object({
  comments: z.string().max(500, 'commentsMaxLength').optional(),
});

type DetailsFormData = z.infer<typeof detailsSchema>;

export default function BookingDetailsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { service, staffMember, start, end, updateState, comments } =
    useBookingStore();

  const { control, handleSubmit, watch } = useForm<DetailsFormData>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      comments: comments || '',
    },
  });

  const commentValue = watch('comments');

  if (!service || !staffMember || !start || !end) {
    return (
      <EmptyContent
        title={t('missingBookingInformation')}
        subtitle={t('completePreviousSteps')}
        icon='alert-circle-outline'
      />
    );
  }

  const onSubmit = (data: DetailsFormData) => {
    updateState({ comments: data.comments });
    toast.success(t('detailsSaved'), {
      description: t('reviewAppointmentBeforeConfirm'),
    });
    router.push('/(app)/appointments/new/summary');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        <View style={styles.content}>
          <BookingProgressStepper currentStep={2} />

          <View style={styles.header}>
            <ThemedText style={styles.title}>{t('addDetails')}</ThemedText>
            <ThemedText style={styles.subtitle}>
              {t('addDetailsSubtitle')}
            </ThemedText>
          </View>

          <View style={styles.field}>
            <ThemedText style={styles.label}>
              {t('commentsSpecialRequestsOptional')}
            </ThemedText>
            <Controller
              control={control}
              name='comments'
              render={({ field: { onChange, value } }) => (
                <>
                  <TextInput
                    style={styles.textArea}
                    multiline
                    numberOfLines={6}
                    maxLength={500}
                    placeholder={t('addCommentsPlaceholder')}
                    placeholderTextColor={theme.mutedForeground}
                    value={value}
                    onChangeText={onChange}
                  />
                  <ThemedText style={styles.charCount}>
                    {t('charactersCounter', {
                      count: commentValue?.length || 0,
                      max: 500,
                    })}
                  </ThemedText>
                </>
              )}
            />
          </View>

          <View style={styles.actions}>
            <Button
              onPress={handleBack}
              variant='outline'
              style={styles.button}
            >
              <ButtonIcon name='arrow-back-outline' />
              <ButtonText>{t('back')}</ButtonText>
            </Button>
            <Button onPress={handleSubmit(onSubmit)} style={styles.button}>
              <ButtonText>{t('continue')}</ButtonText>
              <ButtonIcon name='arrow-forward-outline' />
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    padding: 16,
    gap: 20,
  },
  header: {
    gap: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: theme.mutedForeground,
    lineHeight: 20,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  textArea: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: theme.radius,
    padding: 12,
    fontSize: 15,
    color: theme.foreground,
    backgroundColor: theme.card,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: theme.mutedForeground,
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
  },
});
