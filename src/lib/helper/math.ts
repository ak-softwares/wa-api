interface CalcPercentageParams{
  part: number;
  total: number;
  decimals?: number;
}

export function calcPercentage({part, total, decimals = 0}: CalcPercentageParams) {
  if (!total || total <= 0) return 0;
  const percent = (part / total) * 100;
  return Number(percent.toFixed(decimals));
}

// interface RoundParams {
//   number: number;
//   decimals?: number;
// }

// export function round({ number, decimals = 6 }: RoundParams): number {
//   return Number(number.toFixed(decimals));
// }
export const round = (num: number, decimals = 6): number => Number(num.toFixed(decimals));

