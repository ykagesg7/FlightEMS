import { useCallback, useEffect, useState } from 'react';
import { getPreferredScrollBehavior } from '@/utils/preferredScrollBehavior';
import {
  MDX_HEADING_SCROLL_OFFSET_PX,
  resolveMdxHeadingElement,
  scrollElementToAnchor,
  syncMdxHeadingAnchors,
  type MdxTocHeading,
} from '@/utils/mdxHeadingAnchors';

export type TocItem = MdxTocHeading;

/**
 * 目次（Table of Contents）を自動生成するフック
 */
export const useTableOfContents = (containerSelector: string = '.mdx-container') => {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  const readContainer = useCallback((): Element | null => {
    return document.querySelector(containerSelector);
  }, [containerSelector]);

  const refreshTocItems = useCallback(() => {
    const container = readContainer();
    if (!container) return;
    const items = syncMdxHeadingAnchors(container);
    items.forEach((item) => attachAnchorLink(item));
    setTocItems(items);
  }, [readContainer]);

  useEffect(() => {
    refreshTocItems();

    const handleContentLoaded = () => {
      setTimeout(refreshTocItems, 100);
    };

    window.addEventListener('mdx-content-loaded', handleContentLoaded);
    return () => {
      window.removeEventListener('mdx-content-loaded', handleContentLoaded);
    };
  }, [refreshTocItems]);

  // スクロールスパイ（アクティブな見出しのハイライト）
  useEffect(() => {
    if (tocItems.length === 0) return;

    const headerOffset = MDX_HEADING_SCROLL_OFFSET_PX;

    const updateActiveHeading = () => {
      const scrollY = window.scrollY;
      let activeHeadingId = '';
      let minDistance = Infinity;

      tocItems.forEach((item) => {
        if (!item.element.isConnected) return;
        const rect = item.element.getBoundingClientRect();
        const elementTop = rect.top + scrollY;
        const distanceFromTop = elementTop - scrollY - headerOffset;

        if (distanceFromTop <= headerOffset && distanceFromTop >= -200) {
          const distance = Math.abs(distanceFromTop);
          if (distance < minDistance) {
            minDistance = distance;
            activeHeadingId = item.id;
          }
        }
      });

      if (!activeHeadingId) {
        tocItems.forEach((item) => {
          if (!item.element.isConnected) return;
          const rect = item.element.getBoundingClientRect();
          const elementTop = rect.top + scrollY;
          const distance = elementTop - scrollY - headerOffset;

          if (distance > headerOffset && distance < minDistance) {
            minDistance = distance;
            activeHeadingId = item.id;
          }
        });
      }

      if (activeHeadingId) {
        setActiveId(activeHeadingId);
      }
    };

    const initializeActiveHeading = () => {
      updateActiveHeading();
    };

    setTimeout(initializeActiveHeading, 100);

    let scrollTimeout: ReturnType<typeof setTimeout> | null = null;
    const throttledHandleScroll = () => {
      if (scrollTimeout) return;
      scrollTimeout = setTimeout(() => {
        updateActiveHeading();
        scrollTimeout = null;
      }, 50);
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [tocItems]);

  const scrollToHeading = useCallback(
    (id: string) => {
      const container = readContainer();
      if (!container) return;

      const element = resolveMdxHeadingElement(container, id, tocItems);
      if (!element) return;

      scrollElementToAnchor(element, {
        offsetPx: MDX_HEADING_SCROLL_OFFSET_PX,
        behavior: getPreferredScrollBehavior(),
      });

      window.history.replaceState(null, '', `#${id}`);
    },
    [readContainer, tocItems],
  );

  return {
    tocItems,
    activeId,
    scrollToHeading,
  };
};

function attachAnchorLink(item: TocItem): void {
  const { element, id } = item;
  if (element.querySelector('.anchor-link')) {
    return;
  }

  const anchor = document.createElement('a');
  anchor.href = `#${id}`;
  anchor.className =
    'anchor-link ml-2 opacity-0 hover:opacity-100 transition-opacity duration-200 text-[color:var(--hud-primary)] no-underline';
  anchor.innerHTML = `
    <svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
    </svg>
  `;
  anchor.title = 'このセクションへのリンクをコピー';

  anchor.addEventListener('click', (e) => {
    e.preventDefault();
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard.writeText(url).then(() => {
      anchor.style.opacity = '1';
      anchor.style.transform = 'scale(1.1)';
      setTimeout(() => {
        anchor.style.opacity = '';
        anchor.style.transform = '';
      }, 200);
    }).catch(() => {
      window.location.hash = id;
    });
  });

  element.appendChild(anchor);
}