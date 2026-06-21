import { supabase } from './supabaseClient';
import { fetchPickups } from './fetchPickups';
import { SupabaseError, SupabaseErrorCode } from '../models/supabaseError';
import type { PickupCategory } from '../models/category';

export const deletePickup = async (
  anime_id: number,
  category: string
) => {

  const { error } = await supabase
    .from("pickups")
    .delete()
    .eq("anime_id", anime_id)
    .eq("category", category);

  if (error) {
    throw new SupabaseError(
      SupabaseErrorCode.UNKNOWN,
      error.message,
      error
    );
  }
};

type PickupRow = {
  anime_id: number;
  favorite?: boolean;
  watched?: boolean;
  interested?: boolean;
};

export const deleteAllPickups = async () => {
  const pickups = (await fetchPickups()) as PickupRow[];

  const deleteTargets = pickups.flatMap((pickup) => {
    const categories: PickupCategory[] = [];

    if (pickup.favorite) categories.push('favorite');
    if (pickup.watched) categories.push('watched');
    if (pickup.interested) categories.push('interested');

    return categories.map((category) => deletePickup(pickup.anime_id, category));
  });

  await Promise.all(deleteTargets);
};