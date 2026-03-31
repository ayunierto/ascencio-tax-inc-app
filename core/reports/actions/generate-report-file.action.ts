import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { api } from '@/core/api/api';

export interface GenerateReportPayload {
  startDate: string;
  endDate: string;
  reportType?: string;
}

export interface GenerateReportResponse {
  success: boolean;
  filePath: string;
}

/**
 * Generate a PDF report for the specified date range.
 * Downloads the PDF, saves it to cache, and opens sharing dialog.
 *
 * @param payload - Report generation parameters (startDate, endDate, reportType)
 * @returns Promise with success status and file path
 */
export const generateReportFile = async (
  payload: GenerateReportPayload,
): Promise<GenerateReportResponse> => {
  console.log('[REPORT PDF] Starting PDF generation with payload:', payload);
  console.log('[REPORT PDF] Paths.cache:', Paths.cache?.uri);
  console.log('[REPORT PDF] Paths.document:', Paths.document?.uri);

  try {
    // Request the PDF from API as blob
    console.log('[REPORT PDF] Requesting PDF from API...');
    const response = await api.get('/reports/generate', {
      params: payload,
      responseType: 'blob',
    });
    console.log('[REPORT PDF] API response received, status:', response.status);
    console.log('[REPORT PDF] Response data type:', typeof response.data);
    console.log(
      '[REPORT PDF] Response data constructor:',
      response.data?.constructor?.name,
    );

    // Create file in cache directory
    const fileName = `report-${Date.now()}.pdf`;
    const file = new File(Paths.cache, fileName);

    console.log('[REPORT PDF] File URI:', file.uri);

    // Check if response.data is a Blob
    const blob = response.data;
    console.log('[REPORT PDF] Blob size:', blob?.size, 'type:', blob?.type);

    if (!blob || blob.size === 0) {
      throw new Error('Empty PDF response from server');
    }

    // Convert blob to base64 using FileReader (React Native compatible)
    console.log('[REPORT PDF] Converting blob to base64...');
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Remove data URL prefix (data:application/pdf;base64,)
        const base64Data = result.split(',')[1];
        console.log('[REPORT PDF] Base64 data length:', base64Data?.length);
        resolve(base64Data);
      };
      reader.onerror = (error) => {
        console.error('[REPORT PDF] FileReader error:', error);
        reject(error);
      };
      reader.readAsDataURL(blob);
    });

    // Write base64 data to file using the new API
    console.log('[REPORT PDF] Writing base64 to file...');
    // Decode base64 to bytes
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    console.log('[REPORT PDF] Bytes array length:', bytes.length);

    // Write bytes to file
    file.write(bytes);
    console.log('[REPORT PDF] File written successfully');

    // Get file info to verify it exists
    const fileInfo = await file.info();
    console.log('[REPORT PDF] File info:', JSON.stringify(fileInfo, null, 2));

    if (!fileInfo.exists) {
      throw new Error('File was not created successfully');
    }

    // Share/open the file
    const sharingAvailable = await Sharing.isAvailableAsync();
    console.log('[REPORT PDF] Sharing available:', sharingAvailable);

    if (sharingAvailable) {
      console.log('[REPORT PDF] Opening share dialog...');
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Expense Report',
      });
      console.log('[REPORT PDF] Share dialog closed');
    }

    return { success: true, filePath: file.uri };
  } catch (error: any) {
    console.error('[REPORT PDF] Error generating PDF:', error);
    console.error('[REPORT PDF] Error message:', error?.message);
    console.error('[REPORT PDF] Error stack:', error?.stack);
    throw error;
  }
};

export default generateReportFile;
