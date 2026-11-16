import { getPreferredScrollBehavior } from '@/utils/preferredScrollBehavior';

export type ScrollToQuizOptions = {
  block?: ScrollLogicalPosition;
  inline?: ScrollLogicalPosition;
};

/** クイズ内の指定要素へスクロール（sticky ヘッダー・モバイルパレットは class の scroll-margin で確保） */
export function scrollToQuizAnchor(
  element: HTMLElement | null,
  options: ScrollToQuizOptions = {},
): void {
  if (!element) return;
  const { block = 'start', inline = 'nearest' } = options;
  const behavior = getPreferredScrollBehavior();
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      element.scrollIntoView({
        behavior,
        block,
        inline,
      });
    });
  });
}

/** レイアウト反映後にスクロール（解説 DOM 挿入後など） */
export function scrollToQuizAnchorDeferred(
  element: HTMLElement | null,
  options: ScrollToQuizOptions = {},
  delayMs = 80,
): () => void {
  const id = window.setTimeout(() => scrollToQuizAnchor(element, options), delayMs);
  return () => window.clearTimeout(id);
}
