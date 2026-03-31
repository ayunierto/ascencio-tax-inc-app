import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { ServerException } from '@/core/interfaces/server-exception.response';
import { Invoice, PaginatedResponse } from '@ascencio/shared/interfaces';
import {
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  CreateInvoicePaymentRequest,
} from '@ascencio/shared/schemas';
import {
  createInvoice,
  updateInvoice,
  deleteInvoiceAction,
  bulkDeleteInvoicesAction,
  getInvoicesAction,
  getInvoiceAction,
  generateInvoicePdf,
  GeneratePdfResponse,
} from '../actions';
import { recordInvoicePayment } from '../actions/record-payment.action';

export const useInvoices = (status?: string) => {
  return useQuery<
    PaginatedResponse<Invoice>,
    AxiosError<ServerException>,
    PaginatedResponse<Invoice>,
    (string | undefined)[]
  >({
    queryKey: ['invoices', status],
    queryFn: () => getInvoicesAction(status),
    retry: 1,
    staleTime: 0,
  });
};

export const useInvoice = (id: string) => {
  return useQuery<Invoice, AxiosError<ServerException>, Invoice>({
    queryKey: ['invoice', id],
    queryFn: () => getInvoiceAction(id),
    refetchOnWindowFocus: true,
    retry: 1,
    staleTime: 0,
    enabled: !!id && id !== 'new',
  });
};

export const useCreateInvoiceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Invoice,
    AxiosError<ServerException>,
    CreateInvoiceRequest
  >({
    mutationFn: createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useUpdateInvoiceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Invoice,
    AxiosError<ServerException>,
    { id: string; data: UpdateInvoiceRequest }
  >({
    mutationFn: ({ id, data }) => updateInvoice(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', data.id] });
    },
  });
};

export const useDeleteInvoiceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<{ id: string }, AxiosError<ServerException>, string>({
    mutationFn: deleteInvoiceAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useBulkDeleteInvoicesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, AxiosError<ServerException>, string[]>({
    mutationFn: bulkDeleteInvoicesAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useGeneratePdfMutation = () => {
  return useMutation<GeneratePdfResponse, AxiosError<ServerException>, string>({
    mutationFn: generateInvoicePdf,
  });
};

export const useRecordPaymentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Invoice,
    AxiosError<ServerException>,
    { invoiceId: string; data: CreateInvoicePaymentRequest }
  >({
    mutationFn: ({ invoiceId, data }) => recordInvoicePayment(invoiceId, data),
    onSuccess: (data) => {
      // Invalidate and refetch invoice queries
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', data.id] });
    },
  });
};
