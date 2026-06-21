import { supabase } from './supabaseClient';
import { SupabaseError, SupabaseErrorCode } from '../models/supabaseError';

export interface Tier {
  tier_id: number;
  user_id: string | null;
  name: string;
  description: string | null;
  cover_anime_id: number | null;
  cover_image_url: string | null;
  created_at: string | null;
}

export const fetchTiers = async (userId?: string): Promise<Tier[]> => {
  let query = supabase
    .from('tiers')
    .select('*')
    .order('created_at', { ascending: false });

  // ユーザーIDが指定されている場合、そのユーザーのティア表のみを取得
  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error) {
    throw new SupabaseError(
      SupabaseErrorCode.UNKNOWN,
      error.message,
      error
    );
  }

  return data ?? [];
};
