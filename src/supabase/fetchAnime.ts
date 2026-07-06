import { supabase } from './supabaseClient';
import { SupabaseError, SupabaseErrorCode } from '../models/supabaseError';

import type { AnimeSearchCondition } from '../models/animeModels';

export const fetchAnimes = async (condition: AnimeSearchCondition) => {
  let query = supabase
    .from('anime_with_pickups')
    .select('*');

  console.log(condition.genre);
  console.log(typeof condition.genre);
  console.log(JSON.stringify([condition.genre]));

  // アニメ名：部分一致
  if (condition.title) {
    query = query.ilike('title', `%${condition.title}%`);
  }

  // ジャンル：完全一致
  if (condition.genre) {
    query = query.filter(
      'genres',
      'cs',
      JSON.stringify([condition.genre])
    );
  }

  // 放送時期(季節)：完全一致
  if (condition.season) {
    query = query.eq('season', condition.season);
  }

  // 放送時期(年)：完全一致
  if (condition.season_year) {
    query = query.eq('season_year', condition.season_year);
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

  return data ?? [];
};