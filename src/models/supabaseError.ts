export const SupabaseErrorCode = {
  USER_NAME_EXISTS: 'USER_NAME_EXISTS',
  RATE_LIMIT: 'RATE_LIMIT',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  UNAUTHORIZED: 'UNAUTHORIZED',
  UNKNOWN: 'UNKNOWN',
} as const;

export type SupabaseErrorCode =
  (typeof SupabaseErrorCode)[keyof typeof SupabaseErrorCode];

export class SupabaseError extends Error {
  code: SupabaseErrorCode;
  original?: unknown;

  constructor(
    code: SupabaseErrorCode,
    message?: string,
    original?: unknown
  ) {
    super(message ?? code);
    this.code = code;
    this.original = original;
  }
}