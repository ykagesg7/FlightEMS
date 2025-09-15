import { useEffect, useState } from 'react';

export interface TocItem {
  id: string;
  text: string;
  level: number;
  element: HTMLElement;
}

/**
 * 目次（Table of Contents）を自動生成するフック
 */
export const useTableOfContents = (containerSelector: string = '.mdx-container') => {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const generateToc = () => {
      const container = document.querySelector(containerSelector);
      if (!container) return;

      const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const items: TocItem[] = [];
      const existingIds = new Set<string>();

      // 既存のIDを収集
      headings.forEach((heading) => {
        if (heading.id) {
          existingIds.add(heading.id);
        }
      });

      headings.forEach((heading, index) => {
        const element = heading as HTMLElement;
        const level = parseInt(element.tagName.charAt(1));
        const text = element.textContent || '';

        // 「目次」というテキストの見出しは除外
        if (text.trim() === '目次' || text.trim() === 'Table of Contents') {
          return;
        }

        // IDが未設定の場合は生成
        let id = element.id;
        if (!id) {
          id = generateSlug(text, index, existingIds);
          element.id = id;
        }

        // アンカーリンクアイコンを追加
        if (!element.querySelector('.anchor-link')) {
          const anchor = document.createElement('a');
          anchor.href = `#${id}`;
          anchor.className = 'anchor-link ml-2 opacity-0 hover:opacity-100 transition-opacity duration-200 text-[color:var(--hud-primary)] no-underline';
          anchor.innerHTML = `
            <svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
            </svg>
          `;
          anchor.title = 'このセクションへのリンクをコピー';

          // クリック時にURLをコピー
          anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const url = `${window.location.origin}${window.location.pathname}#${id}`;
            navigator.clipboard.writeText(url).then(() => {
              // 簡単な視覚フィードバック
              anchor.style.opacity = '1';
              anchor.style.transform = 'scale(1.1)';
              setTimeout(() => {
                anchor.style.opacity = '';
                anchor.style.transform = '';
              }, 200);
            }).catch(() => {
              // フォールバック: URLバーを更新
              window.location.hash = id;
            });
          });

          element.appendChild(anchor);
        }

        items.push({
          id,
          text,
          level,
          element,
        });
      });

      setTocItems(items);
    };

    // 初期生成
    generateToc();

    // MDXコンテンツ読み込み完了時に再生成
    const handleContentLoaded = () => {
      setTimeout(generateToc, 100);
    };

    window.addEventListener('mdx-content-loaded', handleContentLoaded);
    return () => {
      window.removeEventListener('mdx-content-loaded', handleContentLoaded);
    };
  }, [containerSelector]);

  // スクロールスパイ
  useEffect(() => {
    if (tocItems.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // 画面内に見える見出しを取得
        const visibleHeadings = entries
          .filter(entry => entry.isIntersecting)
          .map(entry => entry.target.id)
          .filter(Boolean);

        if (visibleHeadings.length > 0) {
          // 最初に見える見出しをアクティブに
          setActiveId(visibleHeadings[0]);
        } else {
          // 何も見えない場合は、最も近い上の見出しを探す
          const scrollY = window.scrollY;
          let closestId = '';
          let closestDistance = Infinity;

          tocItems.forEach(item => {
            const rect = item.element.getBoundingClientRect();
            const distance = Math.abs(rect.top);

            if (rect.top <= 100 && distance < closestDistance) {
              closestDistance = distance;
              closestId = item.id;
            }
          });

          if (closestId) {
            setActiveId(closestId);
          }
        }
      },
      {
        rootMargin: '-20% 0% -35% 0%',
        threshold: 0,
      }
    );

    tocItems.forEach(item => {
      observer.observe(item.element);
    });

    return () => {
      observer.disconnect();
    };
  }, [tocItems]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80; // ヘッダーの高さ分のオフセット
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      // URLを更新（履歴には追加しない）
      window.history.replaceState(null, '', `#${id}`);
    }
  };

  return {
    tocItems,
    activeId,
    scrollToHeading,
  };
};

/**
 * テキストからslugを生成（重複回避）
 */
function generateSlug(text: string, index: number, existingIds: Set<string>): string {
  let baseSlug = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // 特殊文字を除去
    .replace(/\s+/g, '-') // スペースをハイフンに
    .replace(/-+/g, '-') // 連続するハイフンを単一に
    .replace(/^-|-$/g, ''); // 前後のハイフンを除去

  if (!baseSlug) {
    baseSlug = `heading-${index}`;
  }

  // 重複チェックと回避
  let finalSlug = baseSlug;
  let counter = 1;
  while (existingIds.has(finalSlug)) {
    finalSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  existingIds.add(finalSlug);
  return finalSlug;
}
