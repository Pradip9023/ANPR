/**
 * Parking Management Logic & Calculations
 * Duration calculation, fee calculation, duplicate detection debounce,
 * and occupancy status.
 */

export interface ParkingFeeRule {
  freeMinutes: number;
  hourlyRate: number;
  maxDailyRate: number;
}

export const DEFAULT_FEE_RULES: Record<'EMPLOYEE' | 'VISITOR' | 'VIP', ParkingFeeRule> = {
  EMPLOYEE: { freeMinutes: 1440, hourlyRate: 0, maxDailyRate: 0 },
  VIP: { freeMinutes: 1440, hourlyRate: 0, maxDailyRate: 0 },
  VISITOR: { freeMinutes: 30, hourlyRate: 20, maxDailyRate: 250 },
};

/**
 * Calculates human-readable duration between two ISO timestamp dates
 */
export function calculateDuration(entryTimeIso: string, exitTimeIso: string = new Date().toISOString()): {
  totalMinutes: number;
  formattedDuration: string;
} {
  const entry = new Date(entryTimeIso).getTime();
  const exit = new Date(exitTimeIso).getTime();
  const diffMs = Math.max(0, exit - entry);
  const totalMinutes = Math.floor(diffMs / (1000 * 60));

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return { totalMinutes, formattedDuration: `${minutes}m` };
  }
  return { totalMinutes, formattedDuration: `${hours}h ${minutes}m` };
}

/**
 * Calculates parking fee in Indian Rupees (INR ₹)
 */
export function calculateParkingFee(
  entryTimeIso: string,
  exitTimeIso: string = new Date().toISOString(),
  userType: 'EMPLOYEE' | 'VISITOR' | 'VIP' = 'VISITOR',
  customHourlyRate?: number
): number {
  if (userType === 'EMPLOYEE' || userType === 'VIP') {
    return 0;
  }

  const { totalMinutes } = calculateDuration(entryTimeIso, exitTimeIso);
  const rule = DEFAULT_FEE_RULES[userType];
  const rate = customHourlyRate !== undefined ? customHourlyRate : rule.hourlyRate;

  if (totalMinutes <= rule.freeMinutes) {
    return 0;
  }

  const billableMinutes = totalMinutes - rule.freeMinutes;
  const billableHours = Math.ceil(billableMinutes / 60);
  const computedFee = billableHours * rate;

  return Math.min(computedFee, rule.maxDailyRate);
}

/**
 * Check if a camera detection is a duplicate within the debounce threshold window
 * Prevents camera spamming the database with dozens of records for the same vehicle standing at gate
 */
export function isDuplicateDetection(
  lastDetectedAtIso: string | undefined,
  currentTimestampIso: string = new Date().toISOString(),
  debounceSeconds: number = 45
): boolean {
  if (!lastDetectedAtIso) return false;
  const lastTime = new Date(lastDetectedAtIso).getTime();
  const currTime = new Date(currentTimestampIso).getTime();
  const diffSeconds = (currTime - lastTime) / 1000;
  return diffSeconds >= 0 && diffSeconds < debounceSeconds;
}

/**
 * Calculates occupancy stats from current active sessions
 */
export function computeOccupancy(
  totalSlots: number,
  occupiedCount: number
): {
  total: number;
  occupied: number;
  available: number;
  percentage: number;
  status: 'LOW' | 'OPTIMAL' | 'NEAR_FULL' | 'FULL';
} {
  const occupied = Math.max(0, Math.min(occupiedCount, totalSlots));
  const available = Math.max(0, totalSlots - occupied);
  const percentage = totalSlots > 0 ? Math.round((occupied / totalSlots) * 100) : 0;

  let status: 'LOW' | 'OPTIMAL' | 'NEAR_FULL' | 'FULL' = 'OPTIMAL';
  if (percentage < 40) status = 'LOW';
  else if (percentage >= 95) status = 'FULL';
  else if (percentage >= 80) status = 'NEAR_FULL';

  return {
    total: totalSlots,
    occupied,
    available,
    percentage,
    status,
  };
}
