import { supabase } from './supabaseClient';
import { SupabaseError, SupabaseErrorCode } from '../models/supabaseError';
import { fetchAnimeDetail } from './fetchAnimeDetail';
import type { TierRank } from '../constants/tierConstants';

export type UpdateTierItem = {
  anime_id: number;
  tier_rank: TierRank;
  display_order: number;
};

export type UpdateTierParams = {
  tier_id: number;
  name: string;
  description?: string | null;
  items: UpdateTierItem[];
};

export const updateTier = async ({
  tier_id,
  name,
  description,
  items,
}: UpdateTierParams) => {
  // tier の基本情報を更新
  const { error: updateError } = await supabase
    .from('tiers')
    .update({
      name,
      description,
    })
    .eq('tier_id', tier_id);

  if (updateError) {
    throw new SupabaseError(
      SupabaseErrorCode.UNKNOWN,
      updateError.message,
      updateError
    );
  }

  // 既存の tier_items を全て削除
  const { error: deleteError } = await supabase
    .from('tier_items')
    .delete()
    .eq('tier_id', tier_id);

  if (deleteError) {
    throw new SupabaseError(
      SupabaseErrorCode.UNKNOWN,
      deleteError.message,
      deleteError
    );
  }

  if (items.length === 0) {
    return tier_id;
  }

  // 最初のアイテムの画像情報を取得して更新
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
          .eq('tier_id', tier_id);
      }
    } catch (err) {
      console.warn('Failed to fetch cover image:', err);
    }
  }

  // 新しい tier_items を挿入
  const itemsPayload = items.map((item) => ({
    tier_id,
    anime_id: item.anime_id,
    tier_rank: item.tier_rank,
    display_order: item.display_order,
  }));

  const { error: insertError } = await supabase
    .from('tier_items')
    .insert(itemsPayload);

  if (insertError) {
    throw new SupabaseError(
      SupabaseErrorCode.UNKNOWN,
      insertError.message,
      insertError
    );
  }

  return tier_id;
};
