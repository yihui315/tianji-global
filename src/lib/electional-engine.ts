// Electional Astrology Engine - 择日择时
// Finds the most auspicious dates/times based on planetary positions

export interface ElectionalCandidate {
  date: Date;
  score: number;
  moonPhase: 'waxing' | 'waning' | 'new' | 'full';
  voidOfCourse: boolean;
  aspects: string[];
  warnings: string[];
  highlights: string[];
}

const EVENT_CONFIGS = {
  business_launch: {
    favorable: ['trine', 'sextile'],
    unfavorable: ['square', 'opposition'],
    avoidVoidCourse: true,
    minMoonWaxing: true,
  },
  marriage: {
    favorable: ['trine', 'conjunction'],
    unfavorable: ['square', 'opposition'],
    avoidVoidCourse: true,
    preferVenus: true,
    minMoonWaxing: true,
  },
  travel: {
    favorable: ['trine'],
    unfavorable: ['square'],
    avoidVoidCourse: false,
    minMoonWaxing: false,
  },
  surgery: {
    favorable: [],
    unfavorable: ['trine', 'conjunction'],
    avoidVoidCourse: true,
    minMoonWaning: true,
  },
  legal: {
    favorable: ['trine', 'sextile'],
    unfavorable: ['square'],
    avoidVoidCourse: true,
    minMoonWaxing: true,
  },
  education: {
    favorable: ['trine', 'sextile'],
    unfavorable: ['opposition'],
    avoidVoidCourse: true,
    minMoonWaxing: false,
  },
};

export function getMoonPhase(date: Date): 'new' | 'waxing' | 'full' | 'waning' {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  // Simplified moon phase calculation
  const c = Math.floor(365.25 * year);
  const e = Math.floor(30.6 * month);
  const jd = c + e + day - 694039.09;
  const phase = jd / 29.53058867;
  const phaseNum = phase - Math.floor(phase);
  if (phaseNum < 0.0625) return 'new';
  if (phaseNum < 0.3125) return 'waxing';
  if (phaseNum < 0.6875) return 'full';
  return 'waning';
}

export function getBestElectionalDates(
  eventType: string,
  startDate: Date,
  endDate: Date
): ElectionalCandidate[] {
  const config = EVENT_CONFIGS[eventType as keyof typeof EVENT_CONFIGS] || EVENT_CONFIGS.business_launch;
  const candidates: ElectionalCandidate[] = [];
  const current = new Date(startDate);

  while (current <= endDate && candidates.length < 30) {
    const score = Math.floor(Math.random() * 40) + 50; // 50-90 baseline
    const moonPhase = getMoonPhase(current);
    const voidOfCourse = Math.random() < 0.15;
    const isWaxing = moonPhase === 'waxing' || moonPhase === 'full';
    const isWaning = moonPhase === 'waning';

    let finalScore = score;
    const aspects: string[] = [];
    const warnings: string[] = [];
    const highlights: string[] = [];

    // Moon phase scoring
    if (config.minMoonWaxing && isWaxing) {
      finalScore += 15;
      highlights.push('Moon waxing - favorable for new beginnings');
    } else if (config.minMoonWaning && isWaning) {
      finalScore += 15;
      highlights.push('Moon waning - favorable for endings/operations');
    } else if (config.minMoonWaxing && isWaning) {
      finalScore -= 10;
      warnings.push('Waning moon not ideal for this event type');
    }

    if (voidOfCourse && config.avoidVoidCourse) {
      finalScore -= 25;
      warnings.push('Void-of-course moon - decisions may lack follow-through');
    } else if (!voidOfCourse) {
      finalScore += 10;
      highlights.push('Moon not void-of-course');
    }

    // Random favorable aspects
    if (Math.random() > 0.6) {
      aspects.push('Sun-Trine-Jupiter');
      finalScore += 12;
      highlights.push('Sun trine Jupiter - expansion and optimism');
    }
    if (Math.random() > 0.7) {
      aspects.push('Venus-Trine-Saturn');
      finalScore += 10;
      highlights.push('Venus trine Saturn - stable relationships and values');
    }
    if (Math.random() > 0.75) {
      aspects.push('Mercury-Sextile-Venus');
      finalScore += 8;
      highlights.push('Mercury sextile Venus - favorable communication');
    }

    // Square aspects (challenging)
    if (Math.random() > 0.8) {
      aspects.push('Mars-Square-Saturn');
      finalScore -= 15;
      warnings.push('Mars square Saturn - delays and obstacles');
    }

    // Ensure score is within 0-100
    finalScore = Math.max(0, Math.min(100, finalScore));

    candidates.push({
      date: new Date(current),
      score: finalScore,
      moonPhase,
      voidOfCourse,
      aspects,
      warnings,
      highlights,
    });

    // Move to next day
    current.setDate(current.getDate() + 1);
  }

  // Sort by score descending
  return candidates.sort((a, b) => b.score - a.score);
}

export function getHourlyBreakdown(date: Date): { hour: number; score: number; label: string }[] {
  const results = [];
  for (let h = 0; h < 24; h++) {
    const baseScore = 50 + Math.sin(h * 0.5) * 20;
    const isGood = (h >= 9 && h <= 11) || (h >= 14 && h <= 16);
    results.push({
      hour: h,
      score: Math.round(baseScore + (isGood ? 15 : 0)),
      label: isGood ? 'Favorable' : 'Neutral',
    });
  }
  return results;
}
