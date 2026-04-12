export interface ServerValidationError {
  field?: string;
  messageKey?: string;
  message?: string;
}

export interface ServerException {
  message?: string;
  error?: string;
  statusCode?: number;
  errors?: ServerValidationError[];
}
