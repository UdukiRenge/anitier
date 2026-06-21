import { atom } from 'jotai';

// サイドバーの開閉状態
export const isDetailAtom = atom(false);

export type SelectedAnimePreview = {
  anime_id: number;
  title: string;
  cover_image?: string | null;
  favorite: boolean;
  watched: boolean;
  interested: boolean;
};

export const selectedAnimeAtom =
  atom<SelectedAnimePreview | null>(null);