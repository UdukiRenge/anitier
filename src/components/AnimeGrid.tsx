import { AnimeCard } from "./AnimeCard";
import type { SerchedAnime } from "../models/animeModels";
import type { PickupCategory } from "../models/category";

type AnimeGridProps = {
  animeList: SerchedAnime[];
  updatePickupStatus?: (animeId: number, category: PickupCategory, value: boolean) => void;
};

export const AnimeGrid = ({ animeList, updatePickupStatus }: AnimeGridProps) => {
  return (
    <div className="
      grid
      grid-cols-[repeat(auto-fill,minmax(120px,1fr))]
      sm:grid-cols-[repeat(auto-fill,minmax(225px,1fr))]
      gap-4
      w-full
      max-w-6xl
      px-4
      sm:px-6
      mx-auto
      place-items-center
    ">
      {animeList.map((anime) => (
        <AnimeCard 
          key={anime.anime_id} 
          anime_id={anime.anime_id} 
          title={anime.title} 
          cover_image={anime.cover_image} 
          favorite={anime.favorite} 
          watched={anime.watched} 
          interested={anime.interested} 
          updatePickupStatus={updatePickupStatus}
        />
      ))}
    </div>
  );
};