import { useDraggable } from '@dnd-kit/core';
import { useEffect, useState } from "react";
import { useSetAtom } from "jotai";
import { fetchPickups } from "../supabase/fetchPickups";
import { filterByCategory } from "../utils/filterByCategory";
import { spinnerAtom } from "../jotai/spinnerAtom";
import { MESSAGE } from "../constants/message";
import Dialog from "./Dialog";
import useDialog from "../hooks/useDialog";

import type { SerchedAnime } from '../models/animeModels';
import type { PickupCategory } from "../models/category";

const AssetImage: React.FC<{ anime_id: number; title: string; cover_image?: string | null }> = ({ anime_id, title, cover_image }) => {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `asset-${anime_id}`,
    data: { assetId: anime_id, title, imageUrl: cover_image || '/noImage.png' },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="aspect-square rounded overflow-hidden bg-gray-100 cursor-grab active:cursor-grabbing transition hover:opacity-80"
    >
      <img 
        src={cover_image ? cover_image : '/noImage.png'} 
        alt={title} 
        className="w-full h-full object-cover pointer-events-none"
      />
    </div>
  );
};

export const AssetPanel: React.FC = () => {
  const [animeList, setAnimeList] = useState<SerchedAnime[]>([]);
  const [show, setShow] = useState<SerchedAnime[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<PickupCategory>('favorite');
  const [searchTerm, setSearchTerm] = useState('');
  const setSpinner = useSetAtom(spinnerAtom);
  const dialog = useDialog();
  const { showDialog } = dialog;

  useEffect(() => {
    const fetchNominate = async () => {
      setSpinner(true);
      try {
        const pickups = await fetchPickups(["favorite", "watched"]);
        if (pickups && pickups.length > 0) {
          setAnimeList(pickups);
        } else {
          throw new Error('No pickups found');
        }
      } catch (error) {
        console.error('Error fetching pickups:', error);
        showDialog(MESSAGE.error.UNKNOWN);
      } finally {
        setSpinner(false);
      }
    };

    fetchNominate();
  }, [setSpinner, showDialog]);

  useEffect(() => {
    const filtered = filterByCategory(animeList, selectedFilter);
    const keyword = searchTerm.trim().toLowerCase();

    setShow(
      keyword
        ? filtered.filter((anime) =>
            anime.title.toLowerCase().startsWith(keyword)
          )
        : filtered,
    );
  }, [animeList, selectedFilter, searchTerm]);


  return (
    <aside className="flex-1 mb-5 p-4 overflow-y-auto">
      <Dialog
        message={dialog.message}
        isOpen={dialog.isOpen}
        onClose={dialog.closeDialog}
        type={dialog.type}
        onCancel={dialog.closeCancel}
      />
      <div className="space-y-4">
        {/* 検索 */}
        <div className="flex w-full min-w-75 border rounded-full overflow-hidden">
          <input
            type="text"
            placeholder="検索"
            className="flex-1 px-4 py-2 focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* フィルタ */}
        <div className="flex flex-row justify-center gap-4">
          {/* お気に入り */}
          <label className="cursor-pointer">
            <input
              type="radio"
              name="filter"
              value="favorite"
              className="peer hidden"
              checked={selectedFilter === 'favorite'}
              onChange={() => setSelectedFilter('favorite')}
            />
            <span
              className="
                px-4 py-1 rounded border
                text-gray-700
                peer-checked:bg-blue-500
                peer-checked:text-white
                peer-checked:border-blue-500
                transition
              "
            >
              お気に入り
            </span>
          </label>

          {/* 視聴済み */}
          <label className="cursor-pointer">
            <input
              type="radio"
              name="filter"
              value="watched"
              className="peer hidden"
              checked={selectedFilter === 'watched'}
              onChange={() => setSelectedFilter('watched')}
            />
            <span
              className="
                px-4 py-1 rounded border
                text-gray-700
                peer-checked:bg-blue-500
                peer-checked:text-white
                peer-checked:border-blue-500
                transition
              "
            >
              視聴済み
            </span>
          </label>
        </div>

        {/* グリッド */}
        <div className="
          grid gap-3
          grid-cols-[repeat(auto-fill,minmax(100px,1fr))]
        ">
          {show.map((anime) => (
            <AssetImage key={anime.anime_id} anime_id={anime.anime_id} title={anime.title} cover_image={anime.cover_image} />
          ))}
        </div>
      </div>
    </aside>
  );
};