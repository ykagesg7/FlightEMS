import { SpiralLmsRecordAttemptError } from './spiralLmsRecordAttemptError';

/** Server accepts finite scores in [0, 100] (`spiral_lms_validate_score`). */
export function isValidSpiralLmsScore(score: number): boolean {
  return Number.isFinite(score) && score >= 0 && score <= 100;
}

export function assertValidSpiralLmsScore(score: number): void {
  if (!isValidSpiralLmsScore(score)) {
    throw new SpiralLmsRecordAttemptError('invalid_score', 'Score must be a finite number from 0 to 100');
  }
}
