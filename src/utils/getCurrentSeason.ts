// ○○○○年季節の形式で現在の放送時期を取得する。
export const getCurrentSeasonName = (date = new Date()): string => {
  const month = date.getMonth() + 1; // 0始まりなので +1

  let season: string;

  if (month >= 1 && month <= 3) {
    season = 'WINTER';
  } else if (month >= 4 && month <= 6) {
    season = 'SPRING';
  } else if (month >= 7 && month <= 9) {
    season = 'SUMMER';
  } else {
    season = 'FALL';
  }

  return season;
};