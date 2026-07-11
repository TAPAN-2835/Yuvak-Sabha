export function attendancePercentage(present: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((present / total) * 100);
}

/**
 * Monthly regular yuvak rule:
 * - 4 sabhas → at least 3 attended
 * - 5 sabhas → at least 4 attended
 * - otherwise strictly more than 50%
 */
export function isMonthlyRegular(attended: number, totalSabhas: number): boolean {
  if (totalSabhas <= 0) return false;
  if (totalSabhas === 4) return attended >= 3;
  if (totalSabhas === 5) return attended >= 4;
  return attended / totalSabhas > 0.5;
}
