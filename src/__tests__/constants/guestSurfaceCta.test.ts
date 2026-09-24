import { describe, expect, it } from 'vitest';
import {
  GUEST_CTA_PRIMARY_CLASS,
  GUEST_CTA_PRIMARY_COMPACT_CLASS,
  GUEST_CTA_SECONDARY_CLASS,
  GUEST_CTA_TERTIARY_CLASS,
} from '../../constants/guestSurfaceCta';

describe('guestSurfaceCta', () => {
  it('locks primary guest CTA to white surface with brand.secondary text', () => {
    expect(GUEST_CTA_PRIMARY_CLASS).toContain('bg-white');
    expect(GUEST_CTA_PRIMARY_CLASS).toContain('text-brand-secondary');
    expect(GUEST_CTA_PRIMARY_CLASS).not.toContain('bg-brand-primary');
  });

  it('locks secondary guest CTA to brand.primary outline', () => {
    expect(GUEST_CTA_SECONDARY_CLASS).toContain('border-brand-primary');
    expect(GUEST_CTA_SECONDARY_CLASS).toContain('bg-transparent');
    expect(GUEST_CTA_SECONDARY_CLASS).toContain('text-brand-primary');
  });

  it('locks tertiary guest CTA to brand.primary text link', () => {
    expect(GUEST_CTA_TERTIARY_CLASS).toContain('text-brand-primary');
    expect(GUEST_CTA_TERTIARY_CLASS).not.toContain('border-');
    expect(GUEST_CTA_TERTIARY_CLASS).not.toContain('bg-white');
  });

  it('locks compact primary guest CTA for article chrome', () => {
    expect(GUEST_CTA_PRIMARY_COMPACT_CLASS).toContain('bg-white');
    expect(GUEST_CTA_PRIMARY_COMPACT_CLASS).toContain('text-brand-secondary');
  });
});
