import { supabase } from './supabaseClient';
import { SupabaseError, SupabaseErrorCode } from '../models/supabaseError';

export const fetchAnimeDetail = async (anime_id: number) => {
  let query = supabase
    .from('anilist')
    .select('*');

  // アニメ名：部分一致
  if (anime_id) {
    query = query.eq('anime_id', anime_id);
  }

  const { data, error } = await query.order('anime_id', {
    ascending: true,
  });

  if (error) {
    throw new SupabaseError(
      SupabaseErrorCode.UNKNOWN,
      error.message,
      error
    );
  }

  return data && data.length > 0 ? data[0] : null;
};