import type { FriendWithHealth } from '@/hooks/useFriends';
import type { HealthStatus } from './health';
import type { Tag } from './constants';

export function applyGardenFilters(
  friends: FriendWithHealth[],
  selectedTags: Tag[],
  selectedStatuses: HealthStatus[],
): FriendWithHealth[] {
  return friends.filter(({ friend, health }) => {
    const tagMatches = selectedTags.length === 0 || selectedTags.includes(friend.tag as Tag);
    const statusMatches = selectedStatuses.length === 0 || selectedStatuses.includes(health);
    return tagMatches && statusMatches;
  });
}
