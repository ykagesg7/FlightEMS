import { useEffect, useState } from 'react';
import { userRequiresMfaForSensitiveAction } from '../../../auth/mfaAuth';

export function useSensitiveMfaGate() {
  const [loading, setLoading] = useState(true);
  const [factorId, setFactorId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void userRequiresMfaForSensitiveAction().then(({ required, factorId: id }) => {
      if (cancelled) return;
      setFactorId(required ? id : null);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    loading,
    mfaRequired: factorId !== null,
    factorId,
  };
}
