import { TierCard } from './TierCard';
import type { Tier } from '../supabase/fetchTiers';

type TierGridProps = {
  tierList: Tier[];
  isDeleteMode: boolean;
  selectedTierIds: number[];
  onToggleSelect: (tierId: number) => void;
};

export const TierGrid = ({
  tierList,
  isDeleteMode,
  selectedTierIds,
  onToggleSelect,
}: TierGridProps) => {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] mb-5 gap-4 w-full max-w-6xl px-4 sm:px-6 mx-auto place-items-center">
      {tierList.map((tier) => {
        const isSelected = selectedTierIds.includes(tier.tier_id);

        return (
          <TierCard
            key={tier.tier_id}
            tier_id={tier.tier_id}
            name={tier.name}
            cover_image_url={tier.cover_image_url}
            isDeleteMode={isDeleteMode}
            isSelected={isSelected}
            onToggleSelect={onToggleSelect}
          />
        );
      })}
    </div>
  );
};