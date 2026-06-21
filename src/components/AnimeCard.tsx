import { useEffect, useState } from 'react';

import { useAtom, useSetAtom } from 'jotai';
import { isDetailAtom, selectedAnimeAtom } from '../jotai/detailAtom';

import { createPickup } from '../supabase/createPickups';
import { deletePickup } from '../supabase/deletePickups';
import type { PickupCategory } from '../models/category';
import type { SerchedAnime } from '../models/animeModels';

import { FaHeart } from "react-icons/fa";
import { FaExclamation } from "react-icons/fa";
import { FaCheck } from "react-icons/fa";

type AnimeCardProps = SerchedAnime & {
  updatePickupStatus?: (animeId: number, category: PickupCategory, value: boolean) => void;
};

export const AnimeCard = ({ anime_id, title, cover_image, favorite, watched, interested, updatePickupStatus }: AnimeCardProps) => {
  const [detailOpen, setDetailOpen] = useAtom(isDetailAtom);
  const setSelectedAnime = useSetAtom(selectedAnimeAtom);

  const [pickupMap, setPickupMap] = useState({
    favorite: favorite,
    watched: watched,
    interested: interested
  });

  // No image 画像
  const fallbackImage = "/noImage.png";  

  // 実際に表示する画像（null の場合は fallback）
  const displayImage = cover_image || fallbackImage;

  useEffect(() => {
    setPickupMap({
      favorite,
      watched,
      interested
    });
  }, [favorite, watched, interested]);

  const handleCardClick = () => {
    setSelectedAnime({
      anime_id,
      title,
      cover_image,
      favorite,
      watched,
      interested
    });
    setDetailOpen(!detailOpen);
  };

  // お気に入り、気になる、視聴済みの状態を切り替える
  const togglePickup = async (
    anime_id: number,
    category: PickupCategory
  ) => {

    const current = pickupMap[category];
    const next = !current;

    // Optimistic UI
    setPickupMap(prev => ({
      ...prev,
      [category]: next
    }));

    try {

      if (next) {
        await createPickup(anime_id, category);
      } else {
        await deletePickup(anime_id, category);
      }

      // マイページ画面用
      // 更新結果を親コンポーネントに通知する。
      if (updatePickupStatus) {
        updatePickupStatus(
          anime_id,
          category,
          next
        );
      }

    } catch {
      // rollback
      setPickupMap(prev => ({
        ...prev,
        [category]: current
      }));
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow p-2 w-full flex flex-col justify-between sm:p-4"
      onClick={() => handleCardClick()}
    >
      <div className="flex flex-row items-center">
        {/* メイン画像 */}
        <img
          src={displayImage}
          alt={title}
          className="w-4/5 h-auto object-cover rounded"
        />
        <div className='mx-1 mt-1 flex flex-col gap-3 sm:mx-2 sm:mt-2 sm:gap-7'>
          {/* ステータスアイコン */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePickup(anime_id, "favorite");
            }}
          >
            <FaHeart
              className={`text-2xl sm:text-4xl ${pickupMap.favorite ? "text-red-500" : "text-gray-500"}`}
            />
          </button>

          {/* 気になる */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePickup(anime_id, "interested");
            }}
          >
            <FaExclamation
              className={`text-2xl sm:text-4xl ${pickupMap.interested ? "text-yellow-500" : "text-gray-500"}`}
            />
          </button>

          {/* 視聴済み */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePickup(anime_id, "watched");
            }}
          >
            <FaCheck
              className={`text-2xl sm:text-4xl ${pickupMap.watched ? "text-green-500" : "text-gray-500"}`}
            />
          </button>
        </div>
      </div>
      {/* タイトル */}
      <div className="mt-1 text-xs sm:mt-2 sm:text-sm font-semibold h-8 sm:h-10 overflow-hidden">{title}</div>
    </div>
  );
};