import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import type { TierRank } from '../constants/tierConstants';

export const TierItem = ({
  id,
  rank,
  title,
  imageUrl,
}: {
  id: string;
  rank: TierRank;
  title?: string;
  imageUrl?: string;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
    data: { rank, title, imageUrl },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="
        h-1/2 aspect-square
        bg-gray-200 border border-gray-400
        overflow-hidden
        flex items-center justify-center
        text-sm cursor-grab
      "
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={title ?? 'asset'}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-center wrap-break-word px-2">{title || 'IMG'}</span>
      )}
    </div>
  );
};