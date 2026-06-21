import { supabase } from './supabaseClient';
import { AuthError } from '@supabase/supabase-js';
import { SupabaseError, SupabaseErrorCode } from '../models/supabaseError';

export const login = async (user_name: string, password: string) => {
  const email = `${user_name}@anitier.com`;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // 認証失敗（ユーザー名 or パスワード違い）
    if (
      error instanceof AuthError &&
      error.message.includes('Invalid login credentials')
    ) {
      throw new SupabaseError(
        SupabaseErrorCode.INVALID_CREDENTIALS,
        error.message,
        error
      );
    }

    // レートリミット
    if (error.status === 429 || error.message.includes('rate limit')) {
      throw new SupabaseError(
        SupabaseErrorCode.RATE_LIMIT,
        error.message,
        error
      );
    }

    // その他
    throw new SupabaseError(
      SupabaseErrorCode.UNKNOWN,
      error.message,
      error
    );
  }

  return data;
};