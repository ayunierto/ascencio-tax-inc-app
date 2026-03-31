export interface AnalyzedExpense {
  merchant: string;
  date: string;
  total: number | string;
  tax: number | string;
  categoryId: string;
  subcategoryId: string;
}
