import type { KeyboardEvent as ReactKeyboardEvent } from 'react';

/**
 * WAI-ARIA tabs: horizontal roving focus with selection follows focus (ArrowLeft/Right, Home/End).
 */
export function handleArticleHubTablistKeyDown(
  event: ReactKeyboardEvent<HTMLButtonElement>,
  index: number,
  tabCount: number,
  onSelectIndex: (nextIndex: number) => void,
  focusIndex: (nextIndex: number) => void,
): void {
  if (tabCount <= 0) return;

  let nextIndex: number | null = null;
  if (event.key === 'ArrowRight') {
    nextIndex = (index + 1) % tabCount;
  } else if (event.key === 'ArrowLeft') {
    nextIndex = (index - 1 + tabCount) % tabCount;
  } else if (event.key === 'Home') {
    nextIndex = 0;
  } else if (event.key === 'End') {
    nextIndex = tabCount - 1;
  }

  if (nextIndex === null) return;

  event.preventDefault();
  onSelectIndex(nextIndex);
  focusIndex(nextIndex);
}