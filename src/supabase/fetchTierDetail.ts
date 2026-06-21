import { supabase } from './supabaseClient';
import { SupabaseError, SupabaseErrorCode } from '../models/supabaseError';
import type { Tier } from './fetchTiers';

export const fetchTierDetail = async (tier_id: number): Promise<Tier | null> => {
  const { data, error } = await supabase
    .from('tiers')
    .select('*')
    .eq('tier_id', tier_id)
    .single();

  if (error) {
    throw new SupabaseError(
      SupabaseErrorCode.UNKNOWN,
      error.message,
      error
    );
  }

  return data ?? null;
};
