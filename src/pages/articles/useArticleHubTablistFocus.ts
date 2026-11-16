import { useLayoutEffect, useRef, type MutableRefObject } from 'react';

let pendingTabFocusElementId: string | null = null;

function scheduleArticleHubTabFocusById(elementId: string): void {
  pendingTabFocusElementId = elementId;
}

/**
 * Restore keyboard focus to the activated tab after selection commits (survives Outlet remounts).
 */
export function useArticleHubTablistFocus(
  tabRefs: MutableRefObject<Array<HTMLButtonElement | null>>,
  activeIndex: number,
  tabElementIds: readonly string[],
): { scheduleFocus: (index: number) => void } {
  const tabElementIdsRef = useRef(tabElementIds);
  tabElementIdsRef.current = tabElementIds;

  useLayoutEffect(() => {
    if (pendingTabFocusElementId) {
      const target =
        document.getElementById(pendingTabFocusElementId) ??
        tabRefs.current[activeIndex];
      if (target instanceof HTMLElement) {
        target.focus();
      }
      pendingTabFocusElementId = null;
      return;
    }
  }, [activeIndex, tabRefs]);

  return {
    scheduleFocus(index: number) {
      const id = tabElementIdsRef.current[index];
      if (id) {
        scheduleArticleHubTabFocusById(id);
      }
    },
  };
}