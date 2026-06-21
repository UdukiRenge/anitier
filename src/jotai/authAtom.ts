import { atom } from 'jotai';
import type { Session } from '@supabase/supabase-js';

export const sessionAtom = atom<Session | null>(null);