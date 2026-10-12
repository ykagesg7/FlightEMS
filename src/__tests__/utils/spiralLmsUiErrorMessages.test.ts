import { describe, expect, it } from 'vitest';
import { SpiralLmsRecordAttemptError } from '../../utils/spiralLmsRecordAttemptError';
import { spiralLmsErrorKindMessage, spiralLmsQueryErrorMessage } from '../../utils/spiralLmsUiErrorMessages';

describe('spiralLmsUiErrorMessages', () => {
  it('maps error kinds to Japanese copy', () => {
    expect(spiralLmsErrorKindMessage('not_authenticated')).toContain('ログイン');
    expect(spiralLmsErrorKindMessage('network')).toContain('ネットワーク');
    expect(spiralLmsErrorKindMessage('node_locked')).toContain('解放');
  });

  it('classifies query errors', () => {
    expect(spiralLmsQueryErrorMessage(new SpiralLmsRecordAttemptError('network', 'Failed to fetch'))).toContain(
      'ネットワーク',
    );
  });
});
