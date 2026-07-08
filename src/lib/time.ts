export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const days = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

export const DIRECTION_LABEL: Record<string, string> = {
  outbound: 'You watered',
  inbound: 'They reached out',
  mutual: 'Mutual contact',
};
