import { supabase } from './supabaseClient';
import { SupabaseError, SupabaseErrorCode } from '../models/supabaseError';

import type { PickupCategory } from '../models/category';

export const fetchPickups = async (
  filters: PickupCategory[] = [
    "favorite",
    "watched",
    "interested",
  ]
) => {

  let query = supabase
    .from('anime_with_pickups')
    .select('*')
    .order('anime_id', { ascending: true });

  if (filters.length > 0) {
    query = query.or(
      filters
        .map((filter) => `${filter}.eq.true`)
        .join(',')
    );
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