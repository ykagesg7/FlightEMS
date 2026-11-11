import { describe, expect, it } from 'vitest';
import {
  buildAirspaceProvenance,
  buildNotamProvenance,
  formatProvenanceTimestamp,
} from '../../pages/planning/components/map/mapDataProvenance';

describe('mapDataProvenance', () => {
  it('does not invent AIRAC on airspace provenance', () => {
    const line = buildAirspaceProvenance('2026-01-01T00:00:00.000Z');
    expect(line.airacLabel).toBeUndefined();
    expect(line.category).toBe('airspace');
  });

  it('buildNotamProvenance includes SWIM source', () => {
    const line = buildNotamProvenance('2026-01-01T12:00:00.000Z');
    expect(line.category).toBe('notam');
    expect(line.sourceLabel).toContain('SWIM');
  });

  it('formatProvenanceTimestamp returns dash for missing value', () => {
    expect(formatProvenanceTimestamp(undefined)).toBe('—');
  });
});
