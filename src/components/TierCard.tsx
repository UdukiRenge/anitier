import { useNavigate } from 'react-router-dom';

type TierCardProps = {
  tier_id: number;
  name: string;
  cover_image_url?: string | null;
  isDeleteMode: boolean;
  isSelected: boolean;
  onToggleSelect: (tierId: number) => void;
};

export const TierCard = ({
  tier_id,
  name,
  cover_image_url,
  isDeleteMode,
  isSelected,
  onToggleSelect,
}: TierCardProps) => {
  const navigate = useNavigate();

  const fallbackImage = '/noImage.png';
  const displayImage = cover_image_url || fallbackImage;

  const handleCardClick = () => {
    if (isDeleteMode) {
      onToggleSelect(tier_id);
      return;
    }

    navigate(`/tierediter/${tier_id}`);
  };

  return (
    <div
      className={`relative bg-white rounded-lg shadow p-2 w-full aspect-square flex flex-col cursor-pointer hover:shadow-lg transition-shadow ${
        isDeleteMode && isSelected ? 'border-2 border-blue-500 bg-blue-50' : 'border-2 border-transparent'
      }`}
      onClick={handleCardClick}
    >
      {isDeleteMode && isSelected && (
        <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center text-xs sm:text-lg font-bold shadow">
          ✓
        </div>
      )}
      <img
        src={displayImage}
        className="w-full h-full sm:h-auto aspect-square object-cover rounded"
      />
      <div className="mt-1 text-xs sm:mt-2 sm:text-sm font-semibold h-8 sm:h-10 overflow-hidden">{name}</div>
    </div>
  );
};