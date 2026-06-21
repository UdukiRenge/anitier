import { useState, useEffect, useRef, useCallback } from 'react';
import { useAtom, useSetAtom } from 'jotai';

import { spinnerAtom } from '../jotai/spinnerAtom';
import { MESSAGE } from '../constants/message';

import { AnimeGrid } from '../components/AnimeGrid';
import { AnimeDetail } from '../components/AnimeDetail';

import { fetchPickups } from '../supabase/fetchPickups';
import { logout } from '../supabase/logout';
import { filterByCategory } from '../utils/filterByCategory';

import type { SerchedAnime } from '../models/animeModels';
import type { PickupCategory } from '../models/category';
import { isDetailAtom } from '../jotai/detailAtom';
import Dialog from '../components/Dialog';
import useDialog from '../hooks/useDialog';

const tabtypes = [
  { id: 'favorite' as PickupCategory, label: 'お気に入り' },
  { id: 'watched' as PickupCategory, label: '視聴済み' },
  { id: 'interested' as PickupCategory, label: '気になる' },
];

const Mypage: React.FC = () => {
  const setSpinner = useSetAtom(spinnerAtom);
  const dialog = useDialog();

  const [animeList, setAnimeList] = useState<SerchedAnime[]>([]);
  const [show, setShow] = useState<SerchedAnime[]>([]);
  const [tab, setTab] = useState<PickupCategory>('favorite');
  const [isDetailOpen] = useAtom(isDetailAtom);
  const prevOpenRef = useRef(isDetailOpen);

  const setPickups = useCallback(async (mode: PickupCategory) => {
    try {
      setSpinner(true);
      const pickups = await fetchPickups();
      if (pickups && pickups.length > 0) {
        setAnimeList(pickups);
        setShow(filterByCategory(pickups, mode));
      } else {
        setAnimeList([]);
        setShow([]);
      }
    } catch (error) {
      console.error('Error fetching pickups:', error);
      dialog.showDialog(MESSAGE.error.UNKNOWN, '/');
      await logout();
    } finally {
      setSpinner(false);
    }
  }, [setSpinner, dialog]);

  // ピックアップ状態を更新する関数
  const updatePickupStatus = (
    animeId: number,
    category: PickupCategory,
    value: boolean
  ) => {
    const updatedAnimeList = animeList.map((anime) => {
      if (anime.anime_id === animeId) {
        return {
          ...anime,
          [category]: value,
        };
      }

      return anime;
    });

    setAnimeList(updatedAnimeList);

    setShow(
      filterByCategory(updatedAnimeList, tab)
    );
  };

  // 初回表示処理
  useEffect(() => {
    setPickups('favorite');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 詳細画面を閉じたタイミングでマイページのアニメデータを最新化する
  useEffect(() => {
    if (prevOpenRef.current && !isDetailOpen) {
      // true → false の時だけ
      setPickups(tab);
    }
    prevOpenRef.current = isDetailOpen;
  }, [isDetailOpen, tab, setPickups]);

  const handleTabClick = (selectedTab: PickupCategory) => {
    setTab(selectedTab);
    setShow(filterByCategory(animeList, selectedTab));
  }

  const TabButtons = () => {
    return (
      <div className='mt-20 w-4/5'>
        <div className="flex gap-2 border-b justify-center">
          {tabtypes.map(type => (
            <button
              key={type.id}
              onClick={() => handleTabClick(type.id)}
              className={`w-1/3 px-4 py-2 rounded-t-md border-b-2
                ${tab === type.id
                  ? "border-sky-500 text-sky-600 font-bold"
                  : "border-transparent text-gray-500"
                }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="flex flex-col items-center min-h-screen">
      <Dialog
        message={dialog.message}
        isOpen={dialog.isOpen}
        onClose={dialog.closeDialog}
        type={dialog.type}
        onCancel={dialog.closeCancel}
      />
      <AnimeDetail />
      <TabButtons />
      <div className="mt-4 mb-10 w-full flex-1 overflow-y-auto flex justify-center">
        <AnimeGrid 
          animeList={show}
          updatePickupStatus={updatePickupStatus}
        />
      </div>
    </div>
  );
};

export default Mypage;

