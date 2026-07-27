import { describe, expect, it } from 'vitest';
import { shouldPinFromMapClick } from '../../pages/planning/components/map/mapPinInteraction';

function el(html: string): Element {
  const wrap = document.createElement('div');
  wrap.innerHTML = html;
  return wrap.firstElementChild!;
}

describe('shouldPinFromMapClick', () => {
  it('allows plain map background', () => {
    expect(shouldPinFromMapClick(el('<div class="leaflet-container"></div>'))).toBe(true);
  });

  it('blocks leaflet-interactive targets', () => {
    expect(shouldPinFromMapClick(el('<path class="leaflet-interactive"></path>'))).toBe(false);
  });

  it('blocks airspace / notam / detail sheets', () => {
    expect(shouldPinFromMapClick(el('<div class="map-airspace-sheet"></div>'))).toBe(false);
    expect(shouldPinFromMapClick(el('<div class="map-notam-sheet"></div>'))).toBe(false);
    expect(shouldPinFromMapClick(el('<div class="map-cursor-detail-sheet"></div>'))).toBe(false);
  });

  it('allows null / non-Element targets', () => {
    expect(shouldPinFromMapClick(null)).toBe(true);
  });
});
