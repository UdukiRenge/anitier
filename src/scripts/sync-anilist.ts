// コード取得:https://anilist.co/api/v2/oauth/authorize?client_id=35987&response_type=code&redirect_uri=http://localhost:5173/
import sanitizeHtml from "sanitize-html";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

export type AniListAnime = {
  id: number;
  title: { native: string; romaji?: string; english?: string };
  coverImage?: { extraLarge?: string; large?: string };
  season?: string;
  seasonYear?: number;
  format?: string;
  episodes?: number;
  genres?: string[];
  description?: string;
};

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const aniListCode = process.env.VITE_ANILIST_CODE;
const CLIENT_ID = process.env.VITE_ANILIST_CLIENT_ID!;
const CLIENT_SECRET = process.env.VITE_ANILIST_CLIENT_SECRET!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ 環境変数が設定されていません: VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

if (!aniListCode) {
  console.error('❌ 環境変数が設定されていません: VITE_ANILIST_CODE');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// descriptionのHTMLタグを除去
function sanitizeDescription(raw?: string | null) {
  if (!raw) return null;

  const replaced = raw.replace(/<br\s*\/?>/gi, "\n");

  const cleaned = sanitizeHtml(replaced, {
    allowedTags: [],
    allowedAttributes: {},
  });

  return cleaned.trim();
}

// 画像URLを解決（extraLarge > large > null）
const resolveAnimeImageUrl = (coverImage?: AniListAnime['coverImage']): string | null => {
  if (!coverImage) return null;
  return coverImage.extraLarge?.trim() || coverImage.large?.trim() || null;
};

// Supabaseにupsert
async function upsertAniList(animes: AniListAnime[]) {
  // nativeタイトルがない作品はスキップ（例: 海外向けの作品など）
  const filtered = animes.filter(a => a.title.native);

  const formatted = filtered.map((a) => ({
    anime_id: a.id,
    title: a.title.native,
    cover_image: resolveAnimeImageUrl(a.coverImage),
    season: a.season ?? null,
    season_year: a.seasonYear ?? null,
    format: a.format ?? null,
    episodes: a.episodes ?? null,
    genres: a.genres ?? [],
    description_en: sanitizeDescription(a.description),
    description_ja: "", // AniListのdescriptionは基本的に英語なので、日本語版は空にしておく
    updated_at: new Date().toISOString(),
  }));

  if (formatted.length !== animes.length) {
    console.warn(
      `⚠ nativeが存在しない作品を ${animes.length - formatted.length} 件スキップしました`
    );
  }

  const { error } = await supabase
    .from('anilist')
    .upsert(formatted, { onConflict: 'anime_id' });

  if (error) {
    console.error('❌ Supabase insert error:', error);
    throw error;
  }
}

// code からアクセストークンを取得
async function getAccessToken(code: string) {
  const redirectUri = 'http://localhost:5173/'; // code取得時のredirect_uriと同じ
  const res = await axios.post(
    'https://anilist.co/api/v2/oauth/token',
    new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      redirect_uri: redirectUri
    }).toString(),
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }
  );

  return res.data.access_token;
}

// ページごとにAniList GraphQLを呼ぶ（リトライ付き）
async function fetchAniListPageWithRetry(page: number, token: string, retries = 3): Promise<AniListAnime[]> {
  try {
    const query = `
      query ($page: Int) {
        Page(page: $page, perPage: 50) {
          media(type: ANIME, sort: [POPULARITY_DESC]) {
            id
            title { native romaji english }
            coverImage { extraLarge large }
            season
            seasonYear
            format
            episodes
            genres
            description(asHtml: false)
          }
        }
      }
    `;
  
    const { data } = await axios.post(
      'https://graphql.anilist.co',
      { query, variables: { page } },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // ページ取得後に少し待つ（レート制限対策）
    await new Promise(res => setTimeout(res, 4000));
    return data.data.Page.media;

  } catch (err: any) {
    if (err.response?.status === 429 && retries > 0) {
      console.log('⏳ レート制限に引っかかりました。5秒後に再試行します...');
      await new Promise(res => setTimeout(res, 5000));
      return fetchAniListPageWithRetry(page, token, retries - 1);
    }
    throw err;
  }
}

// メイン処理
async function syncAniList() {
  try {
    console.log('📡 AniListデータ同期開始');

    // code からアクセストークン取得
    const accessToken = await getAccessToken(aniListCode!);
    console.log('🟢 Access Token取得完了');

    // データ取得＆Supabase同期
    let page = 1;
    let processedCount = 0;

    while (true) {
      const animes = await fetchAniListPageWithRetry(page, accessToken);
      if (!animes || animes.length === 0) break;

      await upsertAniList(animes);
      processedCount += animes.length;
      console.log(`✅ ページ ${page}: ${animes.length}件処理完了 (合計: ${processedCount}件)`);

      page++;
    }

    console.log(`✨ データ同期完了 (合計: ${processedCount}件)`);

  } catch (error: unknown) {
    console.error('❌ AniList sync error:', error instanceof Error ? error : error);
    process.exit(1);
  }
}

syncAniList();