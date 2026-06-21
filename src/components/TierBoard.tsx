import { useDroppable } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';

import { TierItem } from './TierItem';
import type { TierRank, TierState } from '../constants/tierConstants';

const tierColorMap: Record<TierRank, string> = {
  S: 'bg-red-500',
  A: 'bg-orange-400',
  B: 'bg-yellow-300',
  C: 'bg-green-400',
  D: 'bg-cyan-400',
};

const TierRow = ({ rank, items }: { rank: TierRank; items: TierState[TierRank] }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: rank, // ← Tier を識別
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        flex h-24 border border-black
        ${isOver ? 'bg-blue-100' : ''}
      `}
    >
      {/* ラベル */}
      <div
        className={`
          w-20 flex items-center justify-center text-3xl font-bold
          ${tierColorMap[rank]}
        `}
      >
        {rank}
      </div>

      {/* 中身 */}
      <div className="flex-1 bg-yellow-100 flex overflow-x-auto">
        <SortableContext
          items={items.map(item => item.id)}
          strategy={horizontalListSortingStrategy}
        >
          {items.map((item) => (
            <TierItem
              key={item.id}
              id={item.id}
              rank={rank}
              title={item.title}
              imageUrl={item.imageUrl}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

export const TierBoard = ({
  tiers,
  tierName,
  onNameChange,
}: {
  tiers: TierState;
  tierName: string;
  onNameChange: (value: string) => void;
}) => {
  const TIERS = ['S', 'A', 'B', 'C', 'D'] as const;

  return (
    <section className="flex-2 p-4 overflow-y-auto">
      <div className="mb-4 flex items-center gap-2">
        <input
          type="text"
          value={tierName}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder="ティア表名称"
          className="
            flex-1
            bg-transparent
            border-b border-gray-300
            focus:outline-none
            focus:border-gray-700
            text-lg
            text-black
            placeholder-gray-400
          "
        />
      </div>

      <div className="space-y-2">
        {TIERS.map(tier => (
          <TierRow key={tier} rank={tier} items={tiers[tier]} />
        ))}
      </div>
    </section>
  );
};
