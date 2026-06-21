import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

import { useNavigate, useParams } from 'react-router-dom';
import { useAtom, useSetAtom } from 'jotai';
import { IoArrowBack } from 'react-icons/io5';

import { TierBoard } from '../components/TierBoard';
import { AssetPanel } from '../components/AssetPanel';
import { AssetPanelMobile } from '../components/AssetPanelMobile';
import Dialog from '../components/Dialog';

import { initialTiers } from '../constants/tierConstants';
import type { TierRank, TierState } from '../constants/tierConstants';
import { sessionAtom } from '../jotai/authAtom';
import { spinnerAtom } from '../jotai/spinnerAtom';
import { createTier } from '../supabase/createTier';
import { updateTier } from '../supabase/updateTier';
import { fetchTierDetail } from '../supabase/fetchTierDetail';
import { fetchTierItemsWithAnimeDetail } from '../supabase/fetchTierItems';
import { MESSAGE } from '../constants/message';
import useDialog from '../hooks/useDialog';

const TIER_RANKS = ['S', 'A', 'B', 'C', 'D'] as const
const isTierRank = (id: unknown): id is TierRank =>
  TIER_RANKS.includes(id as TierRank);

const TierEditor: React.FC = () => {
  const navigate = useNavigate();
  const { tier_id } = useParams<{ tier_id: string }>();
  const [session] = useAtom(sessionAtom);
  const setSpinner = useSetAtom(spinnerAtom);
  const dialog = useDialog();
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [isAssetOpen, setIsAssetOpen] = useState(false);
  const [tiers, setTiers] = useState<TierState>(initialTiers);
  const [tierName, setTierName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // ドラッグ中のアイテムのタイトルと画像URLを管理する状態
  const [activeDragData, setActiveDragData] = useState<{
    title: string;
    imageUrl: string;
  } | null>(null);

  // ウィンドウリサイズ時に `isDesktop` を更新
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 既存ティア表のデータをロード
  useEffect(() => {
    const loadTierData = async () => {
      if (!tier_id || tier_id === 'new') return;

      try {
        setSpinner(true);
        const tierId = parseInt(tier_id, 10);

        const [tierDetail, tierItems] = await Promise.all([
          fetchTierDetail(tierId),
          fetchTierItemsWithAnimeDetail(tierId),
        ]);

        if (!tierDetail) {
          dialog.showDialog(MESSAGE.error.UNKNOWN, '/tierlist');
          return;
        }

        setTierName(tierDetail.name);
        setDescription(tierDetail.description ?? '');

        // tier_items をランク別にグループ化
        const groupedByRank: TierState = { S: [], A: [], B: [], C: [], D: [] };
        tierItems.forEach((item) => {
          groupedByRank[item.tier_rank].push({
            id: `tier-item-${item.item_id}`,
            title: item.title,
            imageUrl: item.cover_image ?? '/noImage.png',
            assetId: item.anime_id,
            source: 'tier' as const,
          });
        });

        setTiers(groupedByRank);
      } catch (error) {
        console.error('Failed to load tier data:', error);
        dialog.showDialog(MESSAGE.error.UNKNOWN, '/');
      } finally {
        setSpinner(false);
      }
    };

    loadTierData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setSpinner, tier_id]);

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor)
  );

  const saveTier = async () => {
    if (!session?.user?.id) {
      throw new Error(MESSAGE.error.UNKNOWN);
    }

    if (!tierName.trim()) {
      throw new Error(MESSAGE.error.TIER_NAME_REQUIRED);
    }

    const tierItems = Object.entries(tiers).flatMap(([rank, items]) =>
      items.map((item, index) => ({
        anime_id: item.assetId,
        tier_rank: rank as TierRank,
        display_order: index,
      }))
    );

    const invalidItem = tierItems.find((item) => typeof item.anime_id !== 'number');
    if (invalidItem) {
      throw new Error(MESSAGE.error.UNKNOWN);
    }

    // 既存のティア表を編集している場合は updateTier を呼び出す
    try {
      setSpinner(true);
      if (tier_id && tier_id !== 'new') {
        const tierId = parseInt(tier_id, 10);
        await updateTier({
          tier_id: tierId,
          name: tierName.trim(),
          description: description.trim() || null,
          items: tierItems as {
            anime_id: number;
            tier_rank: TierRank;
            display_order: number;
          }[],
        });
      } else {
        // 新規作成の場合は createTier を呼び出す
        await createTier({
          userId: session.user.id,
          name: tierName.trim(),
          description: description.trim() || null,
          items: tierItems as {
            anime_id: number;
            tier_rank: TierRank;
            display_order: number;
          }[],
        });
      }
    } catch (error) {
      console.error('Failed to save tier:', error);
      throw new Error(MESSAGE.error.UNKNOWN);
    } finally {
      setSpinner(false);
    }
  };

  const handleBackClick = async () => {
    if (isSaving) {
      return;
    }

    const isNewTier = !tier_id || tier_id === 'new';
    const hasAnyContent =
      tierName.trim().length > 0 ||
      description.trim().length > 0 ||
      Object.values(tiers).some((items) => items.length > 0);

    if (isNewTier && !hasAnyContent) {
      navigate('/tierlist');
      return;
    }

    if (isNewTier || (tier_id && tier_id !== 'new')) {
      try {
        setIsSaving(true);
        setSpinner(true);
        await saveTier();
        navigate('/tierlist');
      } catch (error) {
        console.error('Failed to save tier:', error);
        if (error instanceof Error) {
          if (error.message === MESSAGE.error.TIER_NAME_REQUIRED) {
            dialog.showDialog(MESSAGE.error.TIER_NAME_REQUIRED);
          } else {
            dialog.showDialog(MESSAGE.error.UNKNOWN, '/');
          }
        }
      } finally {
        setIsSaving(false);
        setSpinner(false);
      }
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragData({
      title: event.active.data.current?.title || '',
      imageUrl: event.active.data.current?.imageUrl || '/noImage.png',
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    // axtive: ドラッグ中のアイテム
    // over: ドロップ先のターゲット (存在しない場合もある)
    const { active, over } = event;
    setActiveDragData(null);

    // ドラッグ中のアイテムのIDとランクを安全に取得
    const activeId = active.id?.toString();
    const fromRank = active.data.current?.rank as TierRank | undefined;
    // ドラッグ中のアイテムがアセットから来ているかどうかを判定
    const isAsset = activeId?.startsWith('asset-');

    // ティア表外 → 削除 (Tier内のアイテムのみ)
    if (!over) {
      if (!fromRank || isAsset) return;
      // ドラッグ中のアイテム以外のアイテムを残して更新
      setTiers(prev => ({
        ...prev,
        [fromRank]: prev[fromRank].filter(i => i.id !== active.id),
      }));
      return;
    }

    // ドロップ先のランクを取得 (Tier内のアイテム or ティア表の空スペース)
    const toRank: TierRank | undefined =
      over.data.current?.rank ??
      (isTierRank(over.id) ? over.id : undefined);

    if (!toRank) return;

    // アセット → Tier
    if (isAsset) {
      // ドラッグ中のアイテムのタイトルと画像URLを取得
      const title = active.data.current?.title as string | undefined;
      const imageUrl = active.data.current?.imageUrl as string | undefined;
      const assetId = active.data.current?.assetId as number | undefined;
      if (!title) return;

      setTiers(prev => ({
        ...prev,
        [toRank]: [
          ...prev[toRank],
          {
            // dnd-kit用のIDを別途生成 (アセットIDは "asset-" プレフィックスが付いているため衝突しない)
            id: crypto.randomUUID(),
            title,
            imageUrl,
            assetId,
            source: 'asset',
          },
        ],
      }));
      return;
    }

    // 同ランク内 並び替え
    if (fromRank === toRank) {
        setTiers(prev => {
          const items = prev[fromRank];
          // ドラッグ中のアイテムとドロップ先のアイテムのインデックスを取得
          const oldIndex = items.findIndex(i => i.id === active.id);
          const newIndex = items.findIndex(i => i.id === over.id);

          // ドラッグ中のアイテムが見つからない場合は更新しない
          if (oldIndex === -1) return prev;

          return {
            ...prev,
            [fromRank]:
              // ドロップ先が空スペースの場合は末尾に移動、そうでない場合は指定位置に移動
              newIndex === -1
                ? arrayMove(items, oldIndex, items.length - 1)
                : arrayMove(items, oldIndex, newIndex),
          };
        });
        return;
      }

      // Tier 間移動
      if (fromRank && fromRank !== toRank) {
        setTiers(prev => {
          // ドラッグ元とドラッグ先のアイテムリストを取得
          const fromItems = prev[fromRank];
          const toItems = prev[toRank];

          // ドラッグ中のアイテムが見つからない場合は更新しない
          if (!Array.isArray(fromItems) || !Array.isArray(toItems)) return prev;

          // ドラッグ中のアイテムを取得
          const item = fromItems.find(i => i.id === active.id);
          if (!item) return prev;

          // ドラッグ中のアイテム以外を残して更新
          // ドロップ先のアイテムは末尾に追加
          return {
            ...prev,
            [fromRank]: fromItems.filter(i => i.id !== active.id),
            [toRank]: [...toItems, item],
          };
        });
      }
    };

  return (
    <>
      <Dialog
        message={dialog.message}
        isOpen={dialog.isOpen}
        onClose={dialog.closeDialog}
        type={dialog.type}
        onCancel={dialog.closeCancel}
      />

      {/* ===== DnD 対象 ===== */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col h-screen">
          {/* 戻る */}
          <button
            onClick={handleBackClick}
            disabled={isSaving}
            className={`absolute top-17 left-4 text-4xl ${isSaving ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-blue-500'}`}
          >
            <IoArrowBack />
          </button>

          <div className="mt-20 flex-1 flex gap-4 px-4 min-h-0">
            {/* Tier 表 */}
            <div className="mt-5 pb-35 sm:pb-5 flex-2 overflow-y-auto">
              <TierBoard
                tiers={tiers}
                tierName={tierName}
                onNameChange={setTierName}
              />
              <div className="p-4">
                <label className="block text-sm font-medium text-gray-700">
                  説明
                </label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="ティア表の説明を入力"
                  rows={3}
                  className="mt-2 w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* AssetPanel */}
            {isDesktop ? (
              // ===== PC =====
              <div
                className="
                  hidden lg:flex
                  lg:flex-1
                  border-l pl-4
                  min-h-0
                "
              >
                <div className="flex-1 overflow-y-auto pb-20">
                  <AssetPanel />
                </div>
              </div>
            ) : (
              // ===== Mobile =====
              createPortal(
                <AssetPanelMobile
                  isOpen={isAssetOpen}
                  toggle={() => setIsAssetOpen(!isAssetOpen)}
                />,
                document.body
              )
            )}
          </div>
        </div>

        {/* DragOverlay */}
        {createPortal(
          <DragOverlay
            dropAnimation={null}
          >
            {activeDragData && (
              <div className="w-24 h-24 rounded shadow-lg overflow-hidden bg-gray-100">
                <img
                  src={activeDragData.imageUrl}
                  alt={activeDragData.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </>
  );
};

export default TierEditor;