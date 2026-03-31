import { StorageAdapter } from '@/core/adapters/storage.adapter';
import { Directory, File, Paths } from 'expo-file-system';

export const downloadAndSaveReport = async (
  startDate: string,
  endDate: string
): Promise<string> => {
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  if (!API_URL) {
    throw new Error('No API URL found');
  }
  const token = await StorageAdapter.getItem('access_token');
  if (!token) {
    throw new Error('No token found');
  }
  const fileName = `report-${startDate}-${endDate}.pdf`;
  const url = `${API_URL}/reports/generate?startDate=${startDate}&endDate=${endDate}`;
  const destinationUri = new Directory(Paths.document, fileName);

  destinationUri.create();
  const output = await File.downloadFileAsync(url, destinationUri, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log(output.exists); // true
  console.log(output.uri); // path to the downloaded file, e.g., '${cacheDirectory}/pdfs/sample.pdf'

  return output.uri;
};
