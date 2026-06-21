import { useState, useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { spinnerAtom } from '../jotai/spinnerAtom';

import { IoClose } from "react-icons/io5";
import { FaHeart } from "react-icons/fa";
import { FaExclamation } from "react-icons/fa";
import { FaCheck } from "react-icons/fa";

import { seasonMap } from '../constants/seasonMap';
import { MESSAGE } from '../constants/message';

import { createPickup } from '../supabase/createPickups';
import { deletePickup } from '../supabase/deletePickups';
import { isDetailAtom, selectedAnimeAtom } from '../jotai/detailAtom';
import type { AnimeDetailType } from '../models/animeModels';
import type { PickupCategory } from '../models/category';
import Dialog from './Dialog';
import useDialog from '../hooks/useDialog';

interface ButtonsProps {
  favorite: boolean;
  interested: boolean;
  watched: boolean;
  togglePickup: (category: PickupCategory) => void;
  closeDetail: () => void;
}

const fetchAnimeDetail = async (id: number) => {
  const res = await fetch(
    "https://afdbvflforkisvfirzrs.functions.supabase.co/translate",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ id }),
    }
  );

  return await res.json();
};



const TopButtons: React.FC<ButtonsProps> = ({
  favorite,
  interested,
  watched,
  togglePickup,
  closeDetail
}) => {
  return (
    <div className='flex flex-row absolute top-3 right-3 gap-3'>
      {/* ステータスアイコン */}
      <button
        onClick={() => togglePickup('favorite')}
      >
        <FaHeart
          className={`text-3xl ${favorite ? "text-red-500" : "text-gray-500"}`}
        />
      </button>

      {/* 気になる */}
      <button
        onClick={() => togglePickup('interested')}
      >
        <FaExclamation
          className={`text-3xl ${interested ? "text-yellow-500" : "text-gray-500"}`}
        />
      </button>

      {/* 視聴済み */}
      <button
        onClick={() => togglePickup('watched')}
      >
        <FaCheck
          className={`text-3xl ${watched ? "text-green-500" : "text-gray-500"}`}
        />
      </button>

      {/* ×ボタン */}
      <button
        onClick={() => closeDetail()}
        className="
          text-gray-500 hover:text-gray-800
          text-4xl font-bold
          cursor-pointer
        "
        aria-label="close"
      >
        <IoClose />
      </button>
    </div>
  );
}

export const AnimeDetail: React.FC = () => {
  const [isDetailOpen, setIsDetailOpen] = useAtom(isDetailAtom);
  const [selectedAnime, setSelectedAnime] = useAtom(selectedAnimeAtom);
  const [animeDetail, setAnimeDetail] = useState<AnimeDetailType | null>(null);

  const setSpinner = useSetAtom(spinnerAtom);
  const dialog = useDialog();

  const [pickupMap, setPickupMap] = useState({
    favorite: false,
    watched: false,
    interested: false
  });

  const fallbackImage = "/noImage.png";

  const closeDetail = () => {
    setIsDetailOpen(false);
    setSelectedAnime(null);
    setAnimeDetail(null);
  }

  // お気に入り、気になる、視聴済みの状態を切り替える
  const togglePickup = async (category: PickupCategory) => {

    if (!selectedAnime) return;

    const current = pickupMap[category];
    const next = !current;

    // Optimistic UI
    setPickupMap(prev => ({
      ...prev,
      [category]: next
    }));

    try {
      if (next) {
        await createPickup(selectedAnime?.anime_id, category);
      } else {
        await deletePickup(selectedAnime?.anime_id, category);
      }
    } catch {
      // rollback
      setPickupMap(prev => ({
        ...prev,
        [category]: current
      }));
    }
  };

  useEffect(() => {
    if (!selectedAnime?.anime_id) return;

    setPickupMap({
      favorite: selectedAnime.favorite,
      watched: selectedAnime.watched,
      interested: selectedAnime.interested
    });

    const fetchDialogItem = async () => {
      setSpinner(true);
      try {
        const detail = await fetchAnimeDetail(selectedAnime.anime_id);
        setAnimeDetail(detail);
      } catch (error) {
        console.error("Failed to fetch anime detail:", error);
        dialog.showDialog(MESSAGE.error.FEATCH_ANIME_ERROR);
        closeDetail();
      } finally {
        setSpinner(false);
      }
    };

    fetchDialogItem();
  }, [selectedAnime]);

  if (!selectedAnime || !isDetailOpen) return null;

  return (
    <>
      <Dialog
        message={dialog.message}
        isOpen={dialog.isOpen}
        onClose={dialog.closeDialog}
        type={dialog.type}
        onCancel={dialog.closeCancel}
      />
      <div
        className="fixed inset-0 z-40 flex justify-center items-center bg-black/30"
        onClick={() => closeDetail()}
      >
      <div
        className="
          relative flex flex-col bg-white w-3/5 h-3/5 shadow-lg z-50 overflow-y-auto
          lg:flex-row
        "
        onClick={(e) => e.stopPropagation()}
      >
        <TopButtons
          favorite={pickupMap.favorite}
          interested={pickupMap.interested}
          watched={pickupMap.watched}
          togglePickup={togglePickup}
          closeDetail={closeDetail}
        />

        <img
          src={selectedAnime.cover_image || fallbackImage}
          className="mt-10 lg:mt-0 p-5 w-full lg:w-1/2 h-auto aspect-square object-cover"
        />

        <div className="p-5 w-full lg:w-1/2 flex flex-col gap-2">
          <h2 className="lg:mt-7 text-2xl font-bold mb-4">
            {selectedAnime.title}
          </h2>
          {animeDetail?.season_year && (
            <p>
              放送時期： {animeDetail.season_year}{" "}
              {seasonMap[animeDetail.season ?? ""] || animeDetail.season}
            </p>
          )}

          {animeDetail?.episodes !== null && animeDetail?.episodes !== undefined && (
            <p>話数： {animeDetail.episodes}話</p>
          )}

          {animeDetail?.description_ja && (
            <>
              <h3>あらすじ</h3>
              <p>{animeDetail.description_ja}</p>
            </>
          )}
        </div>
      </div>
    </div>
    </>
  );
};