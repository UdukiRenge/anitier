import axios from 'axios';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../supabase/supabaseClient';
import type { AnnictAnime } from '../types/annictWork';

const API_URL = 'https://api.annict.com/v1/works';

type AnictImages = {
  recommended_url?: string | null;
  facebook?: {
    og_image_url?: string | null;
  };
  twitter?: {
    original_avatar_url?: string | null;
    bigger_avatar_url?: string | null;
    normal_avatar_url?: string | null;
  };
};

const resolveAnimeImageUrl = (
  images?: AnictImages
): string | null => {
  if (!images) return null;

  return (
    images.recommended_url?.trim() ||
    images.facebook?.og_image_url?.trim() ||
    images.twitter?.original_avatar_url?.trim() ||
    images.twitter?.bigger_avatar_url?.trim() ||
    images.twitter?.normal_avatar_url?.trim() ||
    null
  );
};

// Supabaseにupsertする関数
async function upsertAnimes(works: AnnictAnime[]) {
  const formatted = works.map((work) => ({
    anime_id: work.id,
    title: work.title,
    title_kana: work.title_kana,
    season_name: work.season_name_text,
    media: work.media_text,
    image_url: resolveAnimeImageUrl(work.images),
    episodes_count: work.episodes_count,
    official_site_url: work.official_site_url,
    twitter_username: work.twitter_username,
    updated_at: new Date().toISOString(),
    status: 'active'
  }));

  const { error } = await supabase
    .from('animes')
    .upsert(formatted, { onConflict: 'anime_id' });

  if (error) {
    console.error('❌ Supabase insert error:', error);
    throw error;
  }
}

// ハンドラー
export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    console.log('データ同期開始');

    // まず全データを stale にする
    const { error: staleError } = await supabase
      .from('animes')
      .update({ status: 'stale' });

    if (staleError) {
      console.error('❌ stale化エラー:', staleError);
      throw staleError;
    }

    let page = 1;

    while (true) {
      // Annict API呼び出し
      const responseponse = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_ANNICT_ACCESS_TOKEN}`
        },
        params: { page, per_page: 50 }
      });

      const animes = responseponse.data.works;

      if (!animes || animes.length === 0) {
        break;
      }

      // Supabaseにupsert
      await upsertAnimes(animes);

      page++;
    }

    response.status(200).json({ message: 'データ同期完了' });

  } catch (error) {
    console.error('❌ Annict sync error:', error);
    response.status(500).json({ error: 'Internal Server Error' });
  }
}