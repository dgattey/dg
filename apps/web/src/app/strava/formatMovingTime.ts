export function formatMovingTime(movingTimeSeconds: number | null | undefined) {
  if (movingTimeSeconds == null || !Number.isFinite(movingTimeSeconds) || movingTimeSeconds <= 0) {
    return null;
  }

  const totalMinutes = Math.round(movingTimeSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) {
    return `${minutes}m`;
  }
  return `${hours}h ${String(minutes).padStart(2, '0')}m`;
}
