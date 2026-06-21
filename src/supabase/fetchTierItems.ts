import { supabase } from './supabaseClient';
import { SupabaseError, SupabaseErrorCode } from '../models/supabaseError';
import type { TierRank } from '../constants/tierConstants';

export interface TierItem {
  item_id?: number;
  tier_id: number;
  anime_id: number;
  tier_rank: TierRank;
  display_order: number;
}

export interface TierItemWithAnime extends TierItem {
  title: string;
  cover_image?: string | null;
}

export const fetchTierItems = async (tier_id: number): Promise<TierItem[]> => {
  const { data, error } = await supabase
    .from('tier_items')
    .select('*')
    .eq('tier_id', tier_id)
    .order('tier_rank', { ascending: true })
    .order('display_order', { ascending: true });

  if (error) {
    throw new SupabaseError(
      SupabaseErrorCode.UNKNOWN,
      error.message,
      error
    );
  }

  return data ?? [];
};

export const fetchTierItemsWithAnimeDetail = async (
  tier_id: number
): Promise<TierItemWithAnime[]> => {
  const tierItems = await fetchTierItems(tier_id);

  if (tierItems.length === 0) {
    return [];
  }

  const animeIds = [...new Set(tierItems.map((item) => item.anime_id))];

  const { data: animeData, error: animeError } = await supabase
    .from('anilist')
    .select('anime_id, title, cover_image')
    .in('anime_id', animeIds);

  if (animeError) {
    throw new SupabaseError(
      SupabaseErrorCode.UNKNOWN,
      animeError.message,
      animeError
    );
  }

  const animeMap = new Map(
    (animeData ?? []).map((anime) => [anime.anime_id, anime])
  );

  return tierItems.map((item) => {
    const anime = animeMap.get(item.anime_id);
    return {
      ...item,
      title: anime?.title ?? 'Unknown',
      cover_image: anime?.cover_image ?? null,
    };
  });
};
