import { supabase } from './supabaseClient';
import { AuthError } from '@supabase/supabase-js';

import { SupabaseError, SupabaseErrorCode } from '../models/supabaseError';

export const signUp = async (password: string, user_name: string) => {
  const { data, error } = await supabase.auth.signUp({
    email: `${user_name}@anitier.com`,
    password,
    options: {
      data: { user_name },
    },
  });

  if (error) {
    // 重複データ
    if (
      error instanceof AuthError &&
      error.message.includes('already registered')
    ) {
      throw new SupabaseError(SupabaseErrorCode.USER_NAME_EXISTS, error.message, error);
    }

    // レートリミット
    if (error.status === 429 || error.message.includes('rate limit')) {
      throw new SupabaseError(
        SupabaseErrorCode.RATE_LIMIT,
        error.message,
        error
      );
    }

    // その他不明なエラー
    throw new SupabaseError(
      SupabaseErrorCode.UNKNOWN,
      error.message,
      error
    );
  }

  return data
}