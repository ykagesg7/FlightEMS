import { describe, it, expect } from 'vitest';
import {
  areSpiralPrerequisitesMet,
  resolveSpiralEffectiveStatus,
} from '../../utils/spiralLmsEffectiveStatus';
import type { SpiralLmsUserProgress } from '../../types/spiralLms';

const baseProgress = (
  nodeId: string,
  status: SpiralLmsUserProgress['status'],
): SpiralLmsUserProgress => ({
  user_id: 'u1',
  node_id: nodeId,
  status,
  attempts: 0,
  last_attempt_at: null,
  mastered_at: null,
  updated_at: '2026-10-01T00:00:00.000Z',
  opensAtLocked: false,
  effectiveStatus: status,
});

describe('resolveSpiralEffectiveStatus', () => {
  it('promotes LOCKED to AVAILABLE when opens_at passed and prerequisites met', () => {
    expect(resolveSpiralEffectiveStatus('LOCKED', false, true)).toBe('AVAILABLE');
  });

  it('keeps LOCKED when opens_at is still in the future', () => {
    expect(resolveSpiralEffectiveStatus('LOCKED', true, true)).toBe('LOCKED');
  });

  it('keeps server status when prerequisites are not met', () => {
    expect(resolveSpiralEffectiveStatus('LOCKED', false, false)).toBe('LOCKED');
  });

  it('returns non-LOCKED server statuses unchanged', () => {
    expect(resolveSpiralEffectiveStatus('IN_PROGRESS', false, false)).toBe('IN_PROGRESS');
  });
});

describe('areSpiralPrerequisitesMet', () => {
  it('requires all prerequisites to be MASTERED', () => {
    const progress = {
      pre: baseProgress('pre', 'MASTERED'),
      other: baseProgress('other', 'AVAILABLE'),
    };
    expect(areSpiralPrerequisitesMet(['pre'], progress)).toBe(true);
    expect(areSpiralPrerequisitesMet(['pre', 'other'], progress)).toBe(false);
  });

  it('treats MAINTENANCE prerequisites as satisfied for display', () => {
    const progress = {
      pre: baseProgress('pre', 'MAINTENANCE'),
      other: baseProgress('other', 'MASTERED'),
    };
    expect(areSpiralPrerequisitesMet(['pre'], progress)).toBe(true);
    expect(areSpiralPrerequisitesMet(['pre', 'other'], progress)).toBe(true);
  });
});
