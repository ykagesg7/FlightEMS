import { describe, expect, it, beforeEach } from 'vitest';
import {
  generatePlainRecoveryCodes,
  hashRecoveryCode,
  normalizeRecoveryCode,
} from '../../../api/_lib/mfaRecoveryCodesCore';

describe('mfaRecoveryCodesCore', () => {
  beforeEach(() => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
  });

  it('normalizes recovery codes', () => {
    expect(normalizeRecoveryCode('abcd-ef12')).toBe('ABCDEF12');
    expect(normalizeRecoveryCode(' ABCD EF12 ')).toBe('ABCDEF12');
  });

  it('hashes consistently', () => {
    const a = hashRecoveryCode('ABCDEF12');
    const b = hashRecoveryCode('ABCDEF12');
    expect(a).toBe(b);
  });

  it('generates requested number of codes', () => {
    const codes = generatePlainRecoveryCodes(3);
    expect(codes).toHaveLength(3);
    expect(codes[0]).toMatch(/^[0-9A-F]{4}-[0-9A-F]{4}$/);
  });
});
