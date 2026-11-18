import { type RefObject, useEffect, useLayoutEffect, useRef } from 'react';
import { getFocusableElements } from '../utils/focusable';
import { lockBodyScroll } from '../utils/modalScrollLock';

type UseModalDialogOptions = {
  open: boolean;
  onClose: () => void;
  /** Element with `role="dialog"` (or native `<dialog>`) that receives focus trapping. */
  containerRef: RefObject<HTMLElement | null>;
  /** When false, Escape does not call onClose (e.g. while submitting). */
  closeOnEscape?: boolean;
};

export function useModalDialog({
  open,
  onClose,
  containerRef,
  closeOnEscape = true,
}: UseModalDialogOptions): void {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    return lockBodyScroll();
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;

    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const container = containerRef.current;
    if (container) {
      const focusables = getFocusableElements(container);
      if (focusables.length > 0) {
        focusables[0].focus();
      } else {
        if (!container.hasAttribute('tabindex')) {
          container.tabIndex = -1;
        }
        container.focus();
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      const container = containerRef.current;
      if (!container) return;

      if (e.key === 'Escape' && closeOnEscape) {
        e.preventDefault();
        e.stopPropagation();
        onCloseRef.current();
        return;
      }

      if (e.key !== 'Tab') return;

      const focusables = getFocusableElements(container);
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (e.shiftKey) {
        if (active === first || !container.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      if (previousFocus?.isConnected) {
        previousFocus.focus();
      }
    };
  }, [open, containerRef, closeOnEscape]);
}