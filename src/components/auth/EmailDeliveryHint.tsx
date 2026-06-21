import {
  EMAIL_DELIVERY_SEARCH_HINT,
  EMAIL_DELIVERY_SPAM_HINT,
} from '../../auth/emailDeliveryNotice';

interface EmailDeliveryHintProps {
  className?: string;
  showSearchHint?: boolean;
}

export function EmailDeliveryHint({ className = '', showSearchHint = false }: EmailDeliveryHintProps) {
  return (
    <div className={`space-y-2 text-sm text-[var(--text-muted)] ${className}`.trim()}>
      <p>{EMAIL_DELIVERY_SPAM_HINT}</p>
      {showSearchHint && <p>{EMAIL_DELIVERY_SEARCH_HINT}</p>}
    </div>
  );
}
