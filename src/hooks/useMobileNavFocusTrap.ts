import { type RefObject, useEffect, useRef } from 'react';

type Params = {
  open: boolean;
  containerRef: RefObject<HTMLElement | null>;
  restoreFocusRef: RefObject<HTMLElement | null>;
  onClose: () => void;
};

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const nodes = container.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  );
  return Array.from(nodes).filter(
    (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true',
  );
}

/**
 * モバイルドロワー内の Tab 循環・Escape 閉じる・閉じたあとフォーカス復帰
 */
export function useMobileNavFocusTrap({
  open,
  containerRef,
  restoreFocusRef,
  onClose,
}: Params): void {
  const prevOpenRef = useRef(open);

  useEffect(() => {
    if (!open) return;
    const container = containerRef.current;
    if (!container) return;

    const focusFirst = () => {
      const list = getFocusableElements(container);
      list[0]?.focus();
    };
    const focusId = window.setTimeout(focusFirst, 60);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const list = getFocusableElements(container);
      if (list.length === 0) return;

      const active = document.activeElement as HTMLElement | null;
      const idx = active ? list.indexOf(active) : -1;

      if (e.shiftKey) {
        if (idx <= 0) {
          e.preventDefault();
          list[list.length - 1]?.focus();
        }
      } else if (idx === -1 || idx === list.length - 1) {
        e.preventDefault();
        list[0]?.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      window.clearTimeout(focusId);
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, [open, containerRef, onClose]);

  useEffect(() => {
    const wasOpen = prevOpenRef.current;
    prevOpenRef.current = open;
    if (wasOpen && !open) {
      restoreFocusRef.current?.focus();
    }
  }, [open, restoreFocusRef]);
}
