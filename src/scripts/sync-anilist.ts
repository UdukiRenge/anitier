// コード取得:https://anilist.co/api/v2/oauth/authorize?client_id=35987&response_type=code&redirect_uri=http://localhost:5173/
import * as sanitizeHtmlNamespace from "sanitize-html";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const sanitizeHtml = (sanitizeHtmlNamespace as any).default ?? sanitizeHtmlNamespace;

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
const CLIENT_ID = process.env.VITE_ANILIST_CLIENT_ID!;
const CLIENT_SECRET = process.env.VITE_ANILIST_CLIENT_SECRET!;
const TOKEN_TABLE = 'anilist_tokens';
const TOKEN_ROW_ID = 'anilist';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ 環境変数が設定されていません: VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ 環境変数が設定されていません: VITE_ANILIST_CLIENT_ID, VITE_ANILIST_CLIENT_SECRET');
  process.exit(1);
}

const supabase = createClient<any, any>(supabaseUrl, supabaseServiceRoleKey);
type AniListTokenRow = {
  id: string;
  refresh_token: string;
  access_token?: string | null;
  expires_at?: string | null;
  updated_at?: string | null;
};

async function fetchStoredToken(): Promise<AniListTokenRow | null> {
  const { data, error } = await supabase
    .from(TOKEN_TABLE)
    .select('*')
    .eq('id', TOKEN_ROW_ID)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('❌ Supabase token fetch error:', error);
    throw error;
  }

  return data ?? null;
}

async function saveTokenRow(row: AniListTokenRow) {
  const { error } = await supabase
    .from(TOKEN_TABLE)
    .upsert(row, { onConflict: 'id' });

  if (error) {
    console.error('❌ Supabase token save error:', error);
    throw error;
  }
}

async function refreshAccessToken(refreshToken: string) {
  const res = await axios.post(
    'https://anilist.co/api/v2/oauth/token',
    new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }).toString(),
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }
  );

  return res.data as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };
}

function tokenIsValid(expiresAt?: string | null) {
  if (!expiresAt) return false;
  const expires = new Date(expiresAt).getTime();
  return expires > Date.now() + 60_000;
}

async function getValidAccessToken() {
  const storedToken = await fetchStoredToken();

  if (storedToken && tokenIsValid(storedToken.expires_at)) {
    console.log('🟢 保存済みアクセストークンが有効です');
    return storedToken.access_token!;
  }

  if (storedToken?.refresh_token) {
    console.log('🔄 refresh_token でアクセストークンを更新します');
    const refreshed = await refreshAccessToken(storedToken.refresh_token);
    const nextRefreshToken = refreshed.refresh_token ?? storedToken.refresh_token;
    const expiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();

    await saveTokenRow({
      id: TOKEN_ROW_ID,
      refresh_token: nextRefreshToken,
      access_token: refreshed.access_token,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    });

    return refreshed.access_token;
  }

  console.error('❌ 有効な refresh_token が見つかりません。まず初回登録用スクリプトで refresh_token を Supabase に保存してください。');
  process.exit(1);
}
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
    const accessToken = await getValidAccessToken();
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