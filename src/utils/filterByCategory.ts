import type { SerchedAnime } from "../models/animeModels";
import type { PickupCategory } from "../models/category";

export const filterByCategory = (animeList: SerchedAnime[], category: PickupCategory): SerchedAnime[] => {
  return animeList.filter((anime) => anime[category]);
};
