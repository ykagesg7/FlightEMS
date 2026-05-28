import { describe, expect, it } from 'vitest';
import {
  flightParametersGridClass,
  mapLayersUseInlineSidebar,
  planningTabPrintWrapperClass,
  planningTabRootGridClass,
} from '../../pages/planning/planningPanelLayout';

describe('planning split layout helpers', () => {
  it('split root layout uses flex column instead of lg:grid-cols-3', () => {
    const split = planningTabRootGridClass('split');
    expect(split).toContain('flex flex-col');
    expect(split).not.toContain('lg:grid-cols-3');
    expect(planningTabRootGridClass('full')).toContain('lg:grid-cols-3');
  });

  it('split print wrapper avoids lg:col-span-3', () => {
    expect(planningTabPrintWrapperClass('split')).not.toContain('col-span');
    expect(planningTabPrintWrapperClass('full')).toContain('lg:col-span-3');
  });

  it('split flight parameters grid avoids lg:grid-cols-3', () => {
    expect(flightParametersGridClass('split')).not.toContain('lg:grid-cols-3');
    expect(flightParametersGridClass('full')).toContain('lg:grid-cols-3');
  });

  it('map layers use overlay drawer on split below xl', () => {
    expect(mapLayersUseInlineSidebar('split', false)).toBe(false);
    expect(mapLayersUseInlineSidebar('split', true)).toBe(true);
    expect(mapLayersUseInlineSidebar('full', false)).toBe(true);
  });
});
