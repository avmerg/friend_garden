import { computeHealth, type HealthInput, type HealthStatus } from './health';
import { TAGS } from './constants';

export interface DashboardFriendInput extends HealthInput {
  tag: string;
}

export interface TagStats {
  total: number;
  notThirstyPercent: number;
  countsByHealth: Record<HealthStatus, number>;
}

export interface DashboardStats {
  totalFriends: number;
  countsByHealth: Record<HealthStatus, number>;
  healthyPercent: number;
  byTag: Record<string, TagStats>;
}

function emptyCounts(): Record<HealthStatus, number> {
  return { HAPPY: 0, OKAY: 0, THIRSTY: 0, RESTING: 0, NEW: 0 };
}

/** "Healthy" = HAPPY, OKAY, or RESTING — i.e. everything except THIRSTY and NEW. */
function healthyPercentOf(counts: Record<HealthStatus, number>, total: number): number {
  if (total === 0) return 0;
  const healthy = counts.HAPPY + counts.OKAY + counts.RESTING;
  return Math.round((100 * healthy) / total);
}

export function computeDashboardStats(friends: DashboardFriendInput[], now: Date): DashboardStats {
  const countsByHealth = emptyCounts();
  const byTag: Record<string, TagStats> = {};
  for (const tag of TAGS) {
    byTag[tag] = { total: 0, notThirstyPercent: 0, countsByHealth: emptyCounts() };
  }

  for (const friend of friends) {
    const health = computeHealth(friend, now);
    countsByHealth[health] += 1;

    if (!byTag[friend.tag]) {
      byTag[friend.tag] = { total: 0, notThirstyPercent: 0, countsByHealth: emptyCounts() };
    }
    byTag[friend.tag].total += 1;
    byTag[friend.tag].countsByHealth[health] += 1;
  }

  for (const tagStats of Object.values(byTag)) {
    tagStats.notThirstyPercent = healthyPercentOf(tagStats.countsByHealth, tagStats.total);
  }

  return {
    totalFriends: friends.length,
    countsByHealth,
    healthyPercent: healthyPercentOf(countsByHealth, friends.length),
    byTag,
  };
}
