import { describe, it, expect } from 'vitest';
import {
  SpiralLmsRecordAttemptError,
  classifySpiralLmsRecordAttemptError,
} from '../../utils/spiralLmsRecordAttemptError';

describe('classifySpiralLmsRecordAttemptError', () => {
  it('preserves SpiralLmsRecordAttemptError instances', () => {
    const error = new SpiralLmsRecordAttemptError('not_authenticated', 'not_authenticated');
    expect(classifySpiralLmsRecordAttemptError(error)).toBe(error);
  });

  it('classifies RPC message tokens', () => {
    expect(classifySpiralLmsRecordAttemptError(new Error('node_locked')).kind).toBe('node_locked');
    expect(classifySpiralLmsRecordAttemptError(new Error('content_not_published')).kind).toBe(
      'content_not_published',
    );
    expect(classifySpiralLmsRecordAttemptError(new Error('idempotency_conflict')).kind).toBe(
      'idempotency_conflict',
    );
  });

  it('classifies network failures', () => {
    expect(classifySpiralLmsRecordAttemptError(new Error('Failed to fetch')).kind).toBe('network');
    expect(classifySpiralLmsRecordAttemptError(new TypeError('Failed to fetch')).kind).toBe(
      'network',
    );
  });

  it('falls back to unknown', () => {
    expect(classifySpiralLmsRecordAttemptError(new Error('something else')).kind).toBe('unknown');
  });
});
