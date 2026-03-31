// TODO: Pending review.
import { ExpenseResponse } from '@/core/accounting/expenses/interfaces';
import {
  ExpenseFormFields,
  expenseSchema,
} from '@/core/accounting/expenses/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { DateTime } from 'luxon';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

export const useExpenseForm = (expense?: ExpenseResponse | null) => {
  const form = useForm<ExpenseFormFields>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      id: expense?.id || 'new',
      merchant: expense?.merchant || '',
      date: expense?.date || DateTime.now().toISO(),
      total: expense?.total || 0,
      tax: expense?.tax || 0,
      notes: expense?.notes || '',
      categoryId: expense?.category?.id || '',
      subcategoryId: expense?.subcategory?.id || '',
      imageUrl: expense?.imageUrl || '',
    },
    mode: 'onChange', // Enable real-time validation
  });

  // Reset form when expense changes (useful for switching between expenses)
  useEffect(() => {
    if (expense) {
      form.reset({
        id: expense.id,
        merchant: expense.merchant,
        date: expense.date,
        total: expense.total,
        tax: expense.tax,
        notes: expense.notes || '',
        categoryId: expense.category?.id || '',
        subcategoryId: expense.subcategory?.id || '',
        imageUrl: expense.imageUrl || '',
      });
    }
  }, [expense, form]);

  // Auto-save draft functionality (optional)
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name && form.formState.isDirty) {
        // Save draft to local storage or state management
        const draftKey = `expense_draft_${expense?.id || 'new'}`;
        try {
          localStorage?.setItem(draftKey, JSON.stringify(value));
        } catch {
          // Handle localStorage not available (React Native)
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form, expense?.id]);

  return form;
};
