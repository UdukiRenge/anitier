import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const aniListCode = process.env.VITE_ANILIST_CODE!;
const CLIENT_ID = process.env.VITE_ANILIST_CLIENT_ID!;
const CLIENT_SECRET = process.env.VITE_ANILIST_CLIENT_SECRET!;
const TOKEN_TABLE = 'anilist_tokens';
const TOKEN_ROW_ID = 'anilist';
const REDIRECT_URI = 'https://anitier-q8mr.vercel.app/';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ 環境変数が設定されていません: VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ 環境変数が設定されていません: VITE_ANILIST_CLIENT_ID, VITE_ANILIST_CLIENT_SECRET');
  process.exit(1);
}

if (!aniListCode) {
  console.error('❌ 環境変数が設定されていません: VITE_ANILIST_CODE');
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

async function saveTokenRow(row: AniListTokenRow) {
  const { error } = await supabase
    .from(TOKEN_TABLE)
    .upsert(row, { onConflict: 'id' });

  if (error) {
    console.error('❌ Supabase token save error:', error);
    throw error;
  }
}

async function exchangeCodeForTokens(code: string) {
  const res = await axios.post(
    'https://anilist.co/api/v2/oauth/token',
    new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      redirect_uri: REDIRECT_URI,
    }).toString(),
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }
  );

  return res.data as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
}

async function main() {
  console.log('📡 初回 token 登録処理を開始します');
  const exchanged = await exchangeCodeForTokens(aniListCode);
  const expiresAt = new Date(Date.now() + exchanged.expires_in * 1000).toISOString();

  await saveTokenRow({
    id: TOKEN_ROW_ID,
    refresh_token: exchanged.refresh_token,
    access_token: exchanged.access_token,
    expires_at: expiresAt,
    updated_at: new Date().toISOString(),
  });

  console.log('✅ refresh_token を Supabase に保存しました');
  console.log('🔒 今後は sync-anilist.ts を自動実行してください');
}

main().catch((error: unknown) => {
  if (axios.isAxiosError(error)) {
    console.error('❌ 初回 token 登録に失敗しました:', error.message);
    console.error('status:', error.response?.status);
    console.error('response data:', error.response?.data);
  } else {
    console.error('❌ 初回 token 登録に失敗しました:', error instanceof Error ? error.message : error);
  }
  process.exit(1);
});