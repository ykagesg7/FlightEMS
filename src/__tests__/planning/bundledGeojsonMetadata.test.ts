import { describe, expect, it } from 'vitest';
import {
  metadataGeneratedToIso,
  summarizeAiracLabel,
  unverifiedCoordinateNoteForNavaid,
} from '../../pages/planning/components/map/bundledGeojsonMetadata';
import { buildItalyNavaidsProvenance } from '../../pages/planning/components/map/mapDataProvenance';

describe('bundledGeojsonMetadata', () => {
  it('metadataGeneratedToIso normalizes YYYY-MM-DD', () => {
    expect(metadataGeneratedToIso('2026-11-11')).toBe('2026-11-11T12:00:00.000Z');
  });

  it('summarizeAiracLabel extracts newest cycle from airac text', () => {
    const airac =
      'Compiled pAIP: ENR 4.1 sheets have different AIRAC effective dates (see source_pages). Newest ENR 4.1 sheets in this file: 06 AUG 2026 (A08/26).';
    expect(summarizeAiracLabel(airac)).toBe('A08/26（ENR 4.1 最新シート）');
  });

  it('unverifiedCoordinateNoteForNavaid returns GRO caveat', () => {
    const notes = [
      'GRO (GROSSETO DVOR): coordinates not published in ENR 4.1.1-4; filled from submitted values (not in AIP) as [11.0717, 42.7597] (unverified).',
    ];
    expect(unverifiedCoordinateNoteForNavaid('GRO', notes)).toContain('unverified');
    expect(unverifiedCoordinateNoteForNavaid('ALG', notes)).toBeUndefined();
  });
});

describe('buildItalyNavaidsProvenance', () => {
  it('includes source and airac label', () => {
    const line = buildItalyNavaidsProvenance({
      sourceLabel: 'AIP Italia ENR 4.1',
      fetchedAtIso: '2026-11-11T12:00:00.000Z',
      airacLabel: 'A08/26（ENR 4.1 最新シート）',
    });
    expect(line.category).toBe('airspace');
    expect(line.sourceLabel).toContain('AIP Italia');
    expect(line.airacLabel).toContain('A08/26');
    expect(line.fetchedAtIso).toBe('2026-11-11T12:00:00.000Z');
  });
});
