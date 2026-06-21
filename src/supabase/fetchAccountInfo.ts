import { AuthError } from '@supabase/supabase-js';

import { supabase } from './supabaseClient';
import { SupabaseError, SupabaseErrorCode } from '../models/supabaseError';

export const fetchAccountInfo = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    if (error instanceof AuthError && error.message.includes('Invalid user')) {
      throw new SupabaseError(
        SupabaseErrorCode.UNAUTHORIZED,
        error.message,
        error
      );
    }

    if (error.status === 429 || error.message.includes('rate limit')) {
      throw new SupabaseError(
        SupabaseErrorCode.RATE_LIMIT,
        error.message,
        error
      );
    }

    throw new SupabaseError(SupabaseErrorCode.UNKNOWN, error.message, error);
  }

  const metadataName =
    typeof user?.user_metadata?.user_name === 'string'
      ? user.user_metadata.user_name
      : '';

  return {
    userId: user?.id ?? '',
    loginId: metadataName || user?.email || '',
  };
};
