import { createClient } from '@supabase/supabase-js'

// 環境変数の取得
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Supabaseクライアント作成
export const supabase = createClient(supabaseUrl, supabaseAnonKey)