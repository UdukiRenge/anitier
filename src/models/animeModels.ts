export type AnimeSearchCondition = {
  title?: string;
  genre?: string;
  season?: string;
  season_year?: number;
};

export type SerchedAnime = {
  anime_id: number;
  title: string;
  cover_image?: string | null;
  favorite: boolean;
  watched: boolean;
  interested: boolean;
};

export type AnimeDetailType = {
  anime_id: number;
  title: string;
  cover_image?: string | null;
  season?: string | null;
  season_year?: number | null;
  format?: number | null;
  episodes?: number | null;
  genres?: string[] | null;
  description_en?: string | null;
  description_ja?: string | null;
  created_at: string;
  updated_at: string;
};