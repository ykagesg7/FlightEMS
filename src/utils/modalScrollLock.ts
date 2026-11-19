const MODAL_SCROLL_LOCK_ATTR = 'data-modal-scroll-locked';

let lockCount = 0;

/** Ref-counted body scroll lock while custom modal dialogs are open. */
export function lockBodyScroll(): () => void {
  lockCount += 1;
  if (lockCount === 1) {
    document.documentElement.setAttribute(MODAL_SCROLL_LOCK_ATTR, '');
  }
  return () => {
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount === 0) {
      document.documentElement.removeAttribute(MODAL_SCROLL_LOCK_ATTR);
    }
  };
}