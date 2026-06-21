import React, { useCallback, useMemo, useState } from 'react';
import { Button } from '../ui';
import { Typography } from '../ui/Typography';

interface MfaRecoveryCodesPanelProps {
  codes: string[];
  title?: string;
  onAcknowledged: () => void;
}

export const MfaRecoveryCodesPanel: React.FC<MfaRecoveryCodesPanelProps> = ({
  codes,
  title = 'リカバリーコード',
  onAcknowledged,
}) => {
  const [copied, setCopied] = useState(false);
  const [ackChecked, setAckChecked] = useState(false);

  const codesText = useMemo(() => codes.join('\n'), [codes]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(codesText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [codesText]);

  return (
    <div className="space-y-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
      <Typography variant="body-sm" className="font-semibold text-amber-200">
        {title}
      </Typography>
      <Typography variant="caption" color="muted" className="block leading-relaxed">
        認証アプリにアクセスできなくなったときに使う使い捨てコードです。
        <strong className="font-semibold text-[var(--text-primary)]"> この画面を閉じると再表示できません。</strong>
        紙に書くか、パスワード管理ツールに保存してください。
      </Typography>
      <ul className="grid gap-2 rounded-lg border border-brand-primary/20 bg-brand-secondary-dark/60 p-3 font-mono text-sm">
        {codes.map((code) => (
          <li key={code} className="text-[var(--text-primary)]">
            {code}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={() => void handleCopy()}>
          {copied ? 'コピーしました' : 'すべてコピー'}
        </Button>
      </div>
      <label className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
        <input
          type="checkbox"
          checked={ackChecked}
          onChange={(e) => setAckChecked(e.target.checked)}
          className="mt-1"
        />
        <span>リカバリーコードを安全な場所に保存しました</span>
      </label>
      <Button type="button" variant="brand" disabled={!ackChecked} onClick={onAcknowledged}>
        保存しました — 続ける
      </Button>
    </div>
  );
};
