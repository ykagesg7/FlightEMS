import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PreflightBriefingProvenance } from '../../pages/planning/components/briefing/PreflightBriefingProvenance';
import { WEATHER_AWC_BRIEFING_SOURCE } from '../../pages/planning/components/map/mapDataProvenance';

describe('PreflightBriefingProvenance', () => {
  it('renders acquisition time and source after fetch', () => {
    render(
      <PreflightBriefingProvenance
        fetchedAtIso="2026-11-11T10:00:00.000Z"
        sourceLabel={WEATHER_AWC_BRIEFING_SOURCE}
      />,
    );
    expect(screen.getByText(/取得 .+ JST/)).toBeTruthy();
    expect(screen.getByText(new RegExp(`出典：${WEATHER_AWC_BRIEFING_SOURCE}`))).toBeTruthy();
  });

  it('renders nothing without fetch time', () => {
    const { container } = render(
      <PreflightBriefingProvenance fetchedAtIso={null} sourceLabel={WEATHER_AWC_BRIEFING_SOURCE} />,
    );
    expect(container.textContent).toBe('');
  });
});
