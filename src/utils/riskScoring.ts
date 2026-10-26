/**
 * Risk scoring calculation for Just-In-Time access requests
 *
 * Rules:
 *  +40 if it is a privileged account request
 *  +25 if the resource name contains "prod" or "production"
 *  +10 / +20 / +30 for durations of 2h / 4h / 8h (0 for shorter)
 *  +15 if submitted outside 9:00-18:00
 *  +20 if the requester has had a denied request before
 *  Capped at 100.
 */

export interface RiskAnalysis {
  score: number;
  label: 'Low' | 'Medium' | 'High';
  reasons: string[];
}

export function computeRiskScore(params: {
  isPrivileged: boolean;
  resourceName: string;
  durationMinutes: number; // e.g. 30, 60, 120, 240, 480
  requestDate?: Date;
  hasDeniedHistory?: boolean;
}): RiskAnalysis {
  let score = 0;
  const reasons: string[] = [];

  // Rule 1: Privileged account request (+40)
  if (params.isPrivileged) {
    score += 40;
    reasons.push('Privileged account (+40)');
  }

  // Rule 2: Resource contains "prod" or "production" (+25)
  const resLower = params.resourceName.toLowerCase();
  if (resLower.includes('prod') || resLower.includes('production')) {
    score += 25;
    reasons.push('Production resource (+25)');
  }

  // Rule 3: Duration (+10 for 2h, +20 for 4h, +30 for 8h, 0 for shorter)
  if (params.durationMinutes >= 480) {
    score += 30;
    reasons.push('Extended duration 8h (+30)');
  } else if (params.durationMinutes >= 240) {
    score += 20;
    reasons.push('Extended duration 4h (+20)');
  } else if (params.durationMinutes >= 120) {
    score += 10;
    reasons.push('Standard duration 2h (+10)');
  }

  // Rule 4: Outside 9:00 - 18:00 (+15)
  const d = params.requestDate || new Date();
  const hour = d.getHours();
  // Outside standard business hours: before 9 or 18:00 and after
  if (hour < 9 || hour >= 18) {
    score += 15;
    reasons.push('Off-hours request (+15)');
  }

  // Rule 5: Requester has had a denied request before (+20)
  if (params.hasDeniedHistory) {
    score += 20;
    reasons.push('Prior denied request history (+20)');
  }

  const cappedScore = Math.min(100, score);

  let label: 'Low' | 'Medium' | 'High';
  if (cappedScore <= 34) {
    label = 'Low';
  } else if (cappedScore <= 64) {
    label = 'Medium';
  } else {
    label = 'High';
  }

  return {
    score: cappedScore,
    label,
    reasons,
  };
}
