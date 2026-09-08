// ISO string -> compact relative label ("just now", "2m", "3h", "Apr 5").
export const formatTime = (iso: string): string => {
  const then = new Date(iso).getTime();
  const diffSec = Math.round((Date.now() - then) / 1000);

  if (diffSec < 45) return 'just now';
  if (diffSec < 3600) return `${Math.round(diffSec / 60)}m`;
  if (diffSec < 86_400) return `${Math.round(diffSec / 3600)}h`;
  if (diffSec < 604_800) return `${Math.round(diffSec / 86_400)}d`;

  return new Date(then).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};
