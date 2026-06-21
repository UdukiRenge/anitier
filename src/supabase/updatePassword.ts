import { AuthError } from '@supabase/supabase-js';

import { supabase } from './supabaseClient';
import { SupabaseError, SupabaseErrorCode } from '../models/supabaseError';

const mapAuthError = (error: unknown) => {
  if (error instanceof AuthError) {
    if (error.message.includes('Invalid login credentials')) {
      return new SupabaseError(
        SupabaseErrorCode.INVALID_CREDENTIALS,
        error.message,
        error
      );
    }

    if (error.status === 429 || error.message.includes('rate limit')) {
      return new SupabaseError(
        SupabaseErrorCode.RATE_LIMIT,
        error.message,
        error
      );
    }
  }

  return new SupabaseError(SupabaseErrorCode.UNKNOWN, 'パスワード更新に失敗しました。', error);
};

export const updatePassword = async (
  currentPassword: string,
  newPassword: string
) => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user?.email) {
    throw new SupabaseError(
      SupabaseErrorCode.UNAUTHORIZED,
      userError?.message ?? '認証情報を取得できませんでした。',
      userError
    );
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (signInError) {
    throw mapAuthError(signInError);
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    throw mapAuthError(updateError);
  }
};
