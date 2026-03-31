import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { api } from '@/core/api/api';

export interface GeneratePdfResponse {
  success: boolean;
  filePath: string;
}

export const generateInvoicePdf = async (
  id: string,
): Promise<GeneratePdfResponse> => {
  console.log('[PDF] Starting PDF generation for invoice:', id);
  console.log('[PDF] Paths.cache:', Paths.cache?.uri);
  console.log('[PDF] Paths.document:', Paths.document?.uri);

  try {
    // Get the PDF as a blob
    console.log('[PDF] Requesting PDF from API...');
    const response = await api.get(`/invoices/${id}/pdf`, {
      responseType: 'blob',
    });
    console.log('[PDF] API response received, status:', response.status);
    console.log('[PDF] Response data type:', typeof response.data);
    console.log(
      '[PDF] Response data constructor:',
      response.data?.constructor?.name,
    );

    // Create file in cache directory
    const fileName = `invoice-${id}-${Date.now()}.pdf`;
    const file = new File(Paths.cache, fileName);

    console.log('[PDF] File URI:', file.uri);

    // Check if response.data is a Blob
    const blob = response.data;
    console.log('[PDF] Blob size:', blob?.size, 'type:', blob?.type);

    if (!blob || blob.size === 0) {
      throw new Error('Empty PDF response from server');
    }

    // Convert blob to base64 using FileReader (React Native compatible)
    console.log('[PDF] Converting blob to base64...');
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Remove data URL prefix (data:application/pdf;base64,)
        const base64Data = result.split(',')[1];
        console.log('[PDF] Base64 data length:', base64Data?.length);
        resolve(base64Data);
      };
      reader.onerror = (error) => {
        console.error('[PDF] FileReader error:', error);
        reject(error);
      };
      reader.readAsDataURL(blob);
    });

    // Write base64 data to file using the new API
    console.log('[PDF] Writing base64 to file...');
    // Decode base64 to bytes
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    console.log('[PDF] Bytes array length:', bytes.length);

    // Write bytes to file
    file.write(bytes);
    console.log('[PDF] File written successfully');

    // Get file info to verify it exists
    const fileInfo = await file.info();
    console.log('[PDF] File info:', JSON.stringify(fileInfo, null, 2));

    if (!fileInfo.exists) {
      throw new Error('File was not created successfully');
    }

    // Share/open the file
    const sharingAvailable = await Sharing.isAvailableAsync();
    console.log('[PDF] Sharing available:', sharingAvailable);

    if (sharingAvailable) {
      console.log('[PDF] Opening share dialog...');
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Invoice PDF',
      });
      console.log('[PDF] Share dialog closed');
    }

    return { success: true, filePath: file.uri };
  } catch (error: any) {
    console.error('[PDF] Error generating PDF:', error);
    console.error('[PDF] Error message:', error?.message);
    console.error('[PDF] Error stack:', error?.stack);
    throw error;
  }
};
