const TEMP_RECEIPT_FOLDER_REGEX = /(^|\/)temp_(files|receipts)\//;

const isHttpUrl = (value: string): boolean => /^https?:\/\//i.test(value);

export const isTemporaryReceiptReference = (value?: string): boolean => {
  if (!value) return false;
  return TEMP_RECEIPT_FOLDER_REGEX.test(value);
};

export const canAnalyzeReceiptReference = (value?: string): boolean => {
  if (!value) return false;
  return isHttpUrl(value) || isTemporaryReceiptReference(value);
};

export const resolveReceiptImageUrl = (value?: string): string | undefined => {
  if (!value) return undefined;
  if (isHttpUrl(value)) return value;

  const cloudinaryCloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudinaryCloudName) {
    return undefined;
  }

  return `https://res.cloudinary.com/${cloudinaryCloudName}/image/upload/${value}`;
};
