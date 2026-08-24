export type Quadrant = 'DO' | 'SCHEDULE' | 'DELEGATE' | 'ELIMINATE';

export function getQuadrant(isUrgent: boolean, isImportant: boolean): Quadrant {
  if (isImportant && isUrgent) {
    return 'DO';
  }
  if (isImportant) {
    return 'SCHEDULE';
  }
  if (isUrgent) {
    return 'DELEGATE';
  }
  return 'ELIMINATE';
}
