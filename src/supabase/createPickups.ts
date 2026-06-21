import { supabase } from './supabaseClient';
import { SupabaseError, SupabaseErrorCode } from '../models/supabaseError';

export const createPickup = async (anime_id: number, category: string) => {

  const { error } = await supabase
    .from("pickups")
    .insert({
      anime_id,
      category
    });

  if (error) {
    throw new SupabaseError(
      SupabaseErrorCode.UNKNOWN,
      error.message,
      error
    );
  }
};