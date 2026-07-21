import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom, useSetAtom } from 'jotai';
import { spinnerAtom } from '../jotai/spinnerAtom';

import { FaSearch, FaCheck } from 'react-icons/fa';
import { AiOutlinePlus } from 'react-icons/ai';
import { IoTrashOutline } from 'react-icons/io5';

import { TierGrid } from '../components/TierGrid';
import { fetchTiers, type Tier } from '../supabase/fetchTiers';
import { deleteTiers } from '../supabase/deleteTier';
import { sessionAtom } from '../jotai/authAtom';
import { MESSAGE } from '../constants/message';
import Dialog from '../components/Dialog';
import useDialog from '../hooks/useDialog';
import SEO from "../components/seo";

const TierList: React.FC = () => {
  const navigate = useNavigate();
  const [session] = useAtom(sessionAtom);
  const setSpinner = useSetAtom(spinnerAtom);
  const dialog = useDialog();

  const [tierList, setTierList] = useState<Tier[]>([]);
  const [isDeleteMode, setIsDeleteMode] = useState<boolean>(false);
  const [selectedTierIds, setSelectedTierIds] = useState<number[]>([]);

  useEffect(() => {
    const loadTiers = async () => {
      try {
        setSpinner(true);
        const data = await fetchTiers(session?.user?.id);
        setTierList(data);
      } catch (error) {
        console.error('Failed to fetch tiers:', error);
        dialog.showDialog(MESSAGE.error.FEATCH_TIERS_ERROR);
      } finally {
        setSpinner(false);
      }
    };

    loadTiers();
  }, []);

  const handleDeleteModeToggle = () => {
    setIsDeleteMode((current) => !current);
    setSelectedTierIds([]);
  };

  const handleTierSelectToggle = (tierId: number) => {
    setSelectedTierIds((current) =>
      current.includes(tierId)
        ? current.filter((id) => id !== tierId)
        : [...current, tierId]
    );
  };

  const handleDeleteConfirm = async () => {
    if (selectedTierIds.length === 0) {
      setIsDeleteMode(false);
      return;
    }

    const selectedCount = selectedTierIds.length;
    const deleteMessage =
      selectedCount === 1
        ? '選択したティア表を削除します。'
        : `選択した${selectedCount}件を削除します。`;

    dialog.showDialog(
      deleteMessage,
      undefined,
      'confirm',
      async () => {
        try {
          setSpinner(true);
          await deleteTiers(selectedTierIds);
          setTierList((current) =>
            current.filter((tier) => !selectedTierIds.includes(tier.tier_id))
          );
          setSelectedTierIds([]);
          setIsDeleteMode(false);
          } catch (error) {
          console.error('Failed to delete tiers:', error);
          dialog.showDialog(MESSAGE.error.UNKNOWN, '/');
        } finally {
          setSpinner(false);
        }
      }
    );
  };

  const SearchArea = () => {
    return (
      <div className="mt-10 w-full flex justify-center">
        <div className="flex flex-row w-full justify-center gap-3">
          <button
            type="button"
            className="bg-blue-500 hover:bg-blue-700 rounded-md p-2 flex items-center justify-center"
            onClick={() => navigate('/tierediter/new')}
          >
            <AiOutlinePlus className="text-white text-3xl" />
          </button>
          <button
            type="button"
            className={`rounded-md p-2 flex items-center justify-center ${
              isDeleteMode
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-500 hover:bg-gray-700'
            }`}
            onClick={isDeleteMode ? handleDeleteConfirm : handleDeleteModeToggle}
            aria-label={isDeleteMode ? '削除を確定' : '削除モードを開始'}
          >
            {isDeleteMode ? (
              <FaCheck className="text-white text-3xl" />
            ) : (
              <IoTrashOutline className="text-white text-3xl" />
            )}
          </button>
          <div className="flex w-full min-w-40 border rounded-full overflow-hidden">
            <input
              type="text"
              placeholder="検索"
              className="flex-1 px-4 py-2 focus:outline-none min-w-0"
            />
            <button
              type="button"
              className="shrink-0 px-4 text-gray-500 hover:bg-gray-100"
            >
              <FaSearch />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <SEO title="ティア表一覧" description="作成したティア表を一覧できます。" />
      <div className="flex flex-col h-screen">
        <Dialog
          message={dialog.message}
          isOpen={dialog.isOpen}
          onClose={dialog.closeDialog}
          type={dialog.type}
          onCancel={dialog.closeCancel}
        />
        <div className="mt-10 mx-auto w-1/2">
          <SearchArea />
        </div>
        <div className="mx-auto my-5 mb-10 min-h-0 max-w-5xl flex flex-col flex-1 gap-4 w-full">
          <div className="flex-1 overflow-y-auto">
            {tierList.length === 0 && (
              <div className="text-center text-gray-500">ティア表がありません</div>
            )}
            {tierList.length > 0 && (
              <TierGrid
                tierList={tierList}
                isDeleteMode={isDeleteMode}
                selectedTierIds={selectedTierIds}
                onToggleSelect={handleTierSelectToggle}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TierList;

