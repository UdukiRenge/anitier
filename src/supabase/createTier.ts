import { supabase } from './supabaseClient';
import { SupabaseError, SupabaseErrorCode } from '../models/supabaseError';
import { fetchAnimeDetail } from './fetchAnimeDetail';
import type { TierRank } from '../constants/tierConstants';

export type CreateTierItem = {
  anime_id: number;
  tier_rank: TierRank;
  display_order: number;
};

export type CreateTierParams = {
  userId: string;
  name: string;
  description?: string | null;
  items: CreateTierItem[];
};

export const createTier = async ({
  userId,
  name,
  description,
  items,
}: CreateTierParams) => {
  const { data: tierData, error: tierError } = await supabase
    .from('tiers')
    .insert({
      user_id: userId,
      name,
      description,
    })
    .select('tier_id')
    .single();

  if (tierError) {
    throw new SupabaseError(
      SupabaseErrorCode.UNKNOWN,
      tierError.message,
      tierError
    );
  }

  if (!tierData?.tier_id) {
    throw new SupabaseError(
      SupabaseErrorCode.UNKNOWN,
      'Failed to create tier record.'
    );
  }

  const tierId = tierData.tier_id;

  // 最初のアイテムの画像情報を取得して tiers に保存
  if (items.length > 0) {
    const firstItem = items[0];
    try {
      const animeDetail = await fetchAnimeDetail(firstItem.anime_id);
      if (animeDetail?.cover_image) {
        await supabase
          .from('tiers')
          .update({
            cover_anime_id: firstItem.anime_id,
            cover_image_url: animeDetail.cover_image,
          })
          .eq('tier_id', tierId);
      }
    } catch (err) {
      // 画像取得失敗時は、tier作成は成功したものとして続行
      console.warn('Failed to fetch cover image:', err);
    }
  }

  if (items.length === 0) {
    return tierId;
  }

  const itemsPayload = items.map((item) => ({
    tier_id: tierId,
    anime_id: item.anime_id,
    tier_rank: item.tier_rank,
    display_order: item.display_order,
  }));

  const { error: itemError } = await supabase
    .from('tier_items')
    .insert(itemsPayload);

  if (itemError) {
    await supabase.from('tiers').delete().eq('tier_id', tierId);
    throw new SupabaseError(
      SupabaseErrorCode.UNKNOWN,
      itemError.message,
      itemError
    );
  }

  return tierId;
};
