export const seasonMap: Record<string, string> = {
  WINTER: '冬',
  SPRING: '春',
  SUMMER: '夏',
  FALL: '秋',
};

export const seasonOptions = Object.entries(seasonMap).map(
  ([value, label]) => ({
    value,
    label
  })
);