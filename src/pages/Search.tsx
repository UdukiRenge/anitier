import { useState, useEffect, useRef } from 'react';
import { useAtom, useSetAtom } from 'jotai';

import { spinnerAtom } from '../jotai/spinnerAtom';
import { FaSearch } from "react-icons/fa";

import { AnimeGrid } from '../components/AnimeGrid';
import { AnimeDetail } from '../components/AnimeDetail';
import { LabeledSelect } from '../components/LabelSelect';
import { fetchAnimes } from '../supabase/fetchAnime';
import { getCurrentSeasonName } from '../utils/getCurrentSeason';

import { genreOptions } from '../constants/genreMap';
import { seasonOptions } from '../constants/seasonMap';
import { MESSAGE } from '../constants/message';

import type { SerchedAnime } from '../models/animeModels';
import { isDetailAtom } from '../jotai/detailAtom';
import Dialog from '../components/Dialog';
import useDialog from '../hooks/useDialog';
import SEO from "../components/seo";

type SearchAreaProps = {
  title: string;
  onTitleChange: (value: string) => void;
  onSearch: () => void;
};

const SearchArea: React.FC<SearchAreaProps> = ({ title, onTitleChange, onSearch }) => {
  return (
    <div className='mt-10 w-full flex justify-center'>
      <div className="flex w-full border rounded-full overflow-hidden">
        <input
          type="text"
          placeholder="検索"
          className="flex-1 px-4 py-2 focus:outline-none min-w-0"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
        />
        <button
          type="button"
          className="shrink-0 px-4 text-gray-500 hover:bg-gray-100"
          onClick={onSearch}
        >
          <FaSearch />
        </button>
      </div>
    </div>
  );
};

type ConditionSearchAreaProps = {
  genre: string;
  onGenreChange: (value: string) => void;
  season: string;
  onSeasonChange: (value: string) => void;
  seasonYear: string;
  onSeasonYearChange: (value: string) => void;
  onSearch: () => void;
};

const ConditionSearchArea: React.FC<ConditionSearchAreaProps> = ({
  genre,
  onGenreChange,
  season,
  onSeasonChange,
  seasonYear,
  onSeasonYearChange,
  onSearch,
}) => {
  const maxYear = new Date().getFullYear() + 1;

  return (
    <div className="mt-5 w-full flex flex-col lg:flex-row justify-center items-center gap-3">
      <LabeledSelect
        label="ジャンル"
        value={genre}
        options={genreOptions}
        onChange={onGenreChange}
      />
      <div className='flex flex-row items-center gap-3'>
        <label className="w-15 text-sm font-medium text-gray-700">
          放送時期
        </label>
        <input
          className='border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400'
          type="number"
          min="1940"
          max={maxYear}
          value={seasonYear}
          onChange={(e) => onSeasonYearChange(e.target.value)}
          placeholder={maxYear.toString()}
        />
        <LabeledSelect
          value={season}
          options={seasonOptions}
          onChange={onSeasonChange}
        />
      </div>
      <button 
        className="bg-black text-white xl:ml-5 h-10 w-1/10 min-w-37.5 rounded-lg border"
        onClick={onSearch}
      >
        検索
      </button>
    </div>
  );
};

const Search: React.FC = () => {
  const [searched, setSearched] = useState<boolean>(false);
  const [condition, setCondition] = useState<boolean>(false);
  const [animeList, setAnimeList] = useState<SerchedAnime[]>([]);
  const [title, setTitle] = useState<string>("");
  const [genre, setGenre] = useState<string>("");
  const [season, setSeason] = useState<string>("");
  const [seasonYear, setSeasonYear] = useState<string>("");
  const [isDetailOpen] = useAtom(isDetailAtom);
  const prevOpenRef = useRef(isDetailOpen);
  const dialog = useDialog();
  const setSpinner = useSetAtom(spinnerAtom);

  // 初回表示処理
  useEffect(() => {
    // supabaseから今期放送中のアニメデータを取得し、stateに保存する。
    const fetchCurrentSeasonAnimes = async () => {
      try {
        setSpinner(true);
        const currentSeason = getCurrentSeasonName();
        const crrentSeasonAnimes = await fetchAnimes({ season: currentSeason, season_year: new Date().getFullYear() });
        setAnimeList(crrentSeasonAnimes);
      } catch (error) {
        console.error('Error fetching current season animes:', error);
        dialog.showDialog(MESSAGE.error.UNKNOWN, '/');
      } finally {
        setSpinner(false);
      }
    };
    fetchCurrentSeasonAnimes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (prevOpenRef.current && !isDetailOpen) {
      if (title || genre || season || seasonYear || searched) {
        handleSearch(title, genre, season, Number(seasonYear));
      } else {
        const fetchCurrentSeasonAnimes = async () => {
          try {
            setSpinner(true);
            const currentSeason = getCurrentSeasonName();
            const currentSeasonAnimes = await fetchAnimes({ season: currentSeason, season_year: new Date().getFullYear() });
            setAnimeList(currentSeasonAnimes);
          } catch (error) {
            console.error('Error fetching current season animes:', error);
            dialog.showDialog(MESSAGE.error.UNKNOWN, '/');
          } finally {
            setSpinner(false);
          }
        };
        fetchCurrentSeasonAnimes();
      }
    }
    prevOpenRef.current = isDetailOpen;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDetailOpen]);

  // 検索処理
  const handleSearch = async (title: string, genre: string, season: string, season_year: number) => {
    try {
      setSpinner(true);
      const searchedAnimes = await fetchAnimes({ 
        title: title || undefined,
        genre: genre || undefined,
        season: season || undefined,
        season_year: season_year ? Number(season_year) : undefined
      });
      setAnimeList(searchedAnimes);
      setSearched(true);
    } catch (error) {
      console.error('Error fetching searched animes:', error);
      dialog.showDialog(MESSAGE.error.UNKNOWN, '/');
    } finally {
      setSpinner(false);
    }
  };
  
  return (
    <>
      <SEO title="検索画面" description="アニメを検索できます。また、検索したアニメにリアクションをつけることができます。" />
      <div className="flex flex-col h-screen">
        <Dialog
          message={dialog.message}
          isOpen={dialog.isOpen}
          onClose={dialog.closeDialog}
          type={dialog.type}
          onCancel={dialog.closeCancel}
        />
        <AnimeDetail/>
        <div className='mt-14 mx-auto w-1/2'>
          <SearchArea
            title={title}
            onTitleChange={setTitle}
            onSearch={() => handleSearch(title, "", "", 0)}
          />
          <p
            className="mt-3 w-fit cursor-pointer text-blue-500 hover:underline"
            onClick={() => setCondition(!condition)} 
          >
            {condition ? "-条件検索" : "+条件検索"}
          </p>
        </div>
        {condition && (
          <ConditionSearchArea
            genre={genre}
            onGenreChange={setGenre}
            season={season}
            onSeasonChange={setSeason}
            seasonYear={seasonYear}
            onSeasonYearChange={setSeasonYear}
            onSearch={() => handleSearch("", genre, season, Number(seasonYear))}
          />
        )}
        <div className="mx-auto mt-5 min-h-0 max-w-5xl flex flex-col flex-1 gap-4 w-full">
          <h2 className="text-xl font-bold ml-5">
            {searched ? "検索結果" : "今期放送中のアニメ"}
          </h2>
          <div className="flex-1 mb-10 overflow-y-auto">
            {animeList.length === 0 && searched && (
              <div className="text-center py-10">
                <p className="text-gray-500">{MESSAGE.info.ANIME_NOTFOUND}</p>
              </div>
            )}
            <AnimeGrid animeList={animeList} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Search;

