import { supabase } from './supabaseClient';
import { SupabaseError, SupabaseErrorCode } from '../models/supabaseError';

export const deleteTiers = async (tierIds: number[]) => {
  if (tierIds.length === 0) {
    return;
  }

  const { error: itemError } = await supabase
    .from('tier_items')
    .delete()
    .in('tier_id', tierIds);

  if (itemError) {
    throw new SupabaseError(
      SupabaseErrorCode.UNKNOWN,
      itemError.message,
      itemError
    );
  }

  const { error: tierError } = await supabase
    .from('tiers')
    .delete()
    .in('tier_id', tierIds);

  if (tierError) {
    throw new SupabaseError(
      SupabaseErrorCode.UNKNOWN,
      tierError.message,
      tierError
    );
  }
};
