export type TierRank = 'S' | 'A' | 'B' | 'C' | 'D';

export type TierItem = {
  id: string;
  title: string;
  assetId?: number;
  imageUrl?: string;
  source?: 'asset' | 'tier';
};

export type TierState = {
  [rank in TierRank]: TierItem[];
};

export const initialTiers: TierState = {
  S: [],
  A: [],
  B: [],
  C: [],
  D: []
};