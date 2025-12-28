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
  const [readSections, setReadSections] = useState<Set<string>>(new Set());
  const [sectionProgress, setSectionProgress] = useState<{ current: number; total: number; percentage: number }>({ current: 0, total: 0, percentage: 0 });

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

        // 「目次」というテキストの見出しは除外（関連記事は目次に表示するが進捗計算からは除外）
        const trimmedText = text.trim();
        if (trimmedText === '目次' || trimmedText === 'Table of Contents') {
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

  // スクロールスパイと進捗計算
  useEffect(() => {
    if (tocItems.length === 0) {
      setSectionProgress({ current: 0, total: 0, percentage: 0 });
      setReadSections(new Set());
      return;
    }

    // 通過した見出しを追跡するSet（クロージャーで保持）
    const readSetRef = { current: new Set<string>() };
    let lastReadIndexRef = { current: -1 };

    const updateProgress = () => {
      const totalSections = tocItems.length;
      if (totalSections === 0) return;

      // 「関連記事」セクションを探す（進捗計算から除外するため）
      const relatedArticlesIndex = tocItems.findIndex(item => {
        const text = item.element.textContent?.trim() || '';
        return text === '関連記事' || text === 'Related Articles';
      });

      // 進捗計算に使用する見出し数（関連記事を含まない）
      const progressSections = relatedArticlesIndex >= 0 ? relatedArticlesIndex : totalSections;

      // 最後の本文セクション（関連記事の前）に到達したかチェック
      const lastContentSectionIndex = relatedArticlesIndex >= 0 ? relatedArticlesIndex - 1 : totalSections - 1;
      const lastContentSection = lastContentSectionIndex >= 0 ? tocItems[lastContentSectionIndex] : null;
      const isLastContentSectionRead = lastContentSection && readSetRef.current.has(lastContentSection.id);

      // 関連記事セクションに到達した場合も100%とする（関連記事に到達 = 最終セクション読了）
      const relatedArticlesReached = relatedArticlesIndex >= 0 &&
        readSetRef.current.has(tocItems[relatedArticlesIndex].id);

      // 最後の本文セクションまたは関連記事に到達したら100%
      let currentSections = 0;

      // 通過した見出しをカウント（関連記事は除外）
      const maxCountIndex = relatedArticlesIndex >= 0 ? relatedArticlesIndex : totalSections;
      for (let i = 0; i < maxCountIndex; i++) {
        if (readSetRef.current.has(tocItems[i].id)) {
          currentSections++;
        }
      }

      if (isLastContentSectionRead || relatedArticlesReached) {
        currentSections = progressSections;
      } else if (lastReadIndexRef.current >= 0) {
        // 最後に通過した見出しのインデックス+1（0ベースなので+1）
        // ただし、関連記事以降はカウントしない
        const maxIndex = relatedArticlesIndex >= 0
          ? Math.min(lastReadIndexRef.current, relatedArticlesIndex - 1)
          : lastReadIndexRef.current;
        currentSections = Math.max(currentSections, maxIndex + 1);
      }

      const percentage = progressSections > 0
        ? Math.min(100, Math.round((currentSections / progressSections) * 100))
        : 0;

      setReadSections(new Set(readSetRef.current));
      setSectionProgress({
        current: currentSections,
        total: progressSections, // 進捗計算用の総数（関連記事を除く）
        percentage
      });
    };

    // アクティブな見出しを更新する関数
    const updateActiveHeading = () => {
      const scrollY = window.scrollY;
      const headerOffset = 100; // ヘッダー分のオフセット
      let activeHeadingId = '';
      let minDistance = Infinity;

      // 各見出しについて、画面の上部（ヘッダーより下）に最も近い見出しを探す
      tocItems.forEach(item => {
        const rect = item.element.getBoundingClientRect();
        const elementTop = rect.top + scrollY;
        const distanceFromTop = elementTop - scrollY - headerOffset;

        // 見出しが画面の上部（ヘッダーより下）を通過している、または通過した直後
        if (distanceFromTop <= headerOffset && distanceFromTop >= -200) {
          const distance = Math.abs(distanceFromTop);
          if (distance < minDistance) {
            minDistance = distance;
            activeHeadingId = item.id;
          }
        }
      });

      // 見出しが見つからない場合、最も近い上の見出しを探す
      if (!activeHeadingId) {
        tocItems.forEach(item => {
          const rect = item.element.getBoundingClientRect();
          const elementTop = rect.top + scrollY;
          const distance = elementTop - scrollY - headerOffset;

          // 見出しがまだ画面の上にある場合
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

    const observer = new IntersectionObserver(
      (entries) => {
        // 通過した見出しを記録（画面の上部を通過した見出し）
        let progressUpdated = false;
        entries.forEach(entry => {
          const headingId = entry.target.id;
          if (!headingId) return;

          // 見出しが画面の上部（100px以内）を通過したかチェック
          const rect = entry.boundingClientRect;
          if (rect.top <= 100 && rect.bottom >= 0) {
            if (!readSetRef.current.has(headingId)) {
              readSetRef.current.add(headingId);
              progressUpdated = true;

              // 通過した見出しのインデックスを更新
              const index = tocItems.findIndex(item => item.id === headingId);
              if (index > lastReadIndexRef.current) {
                lastReadIndexRef.current = index;
              }
            }
          }
        });

        if (progressUpdated) {
          updateProgress();
        }
      },
      {
        rootMargin: '-100px 0% -50% 0%', // ヘッダー分のオフセットを考慮
        threshold: [0, 0.1, 0.5, 1.0], // 複数の閾値で監視
      }
    );

    // スクロール位置から既に通過した見出しを初期化
    const initializeReadSections = () => {
      const scrollY = window.scrollY;
      tocItems.forEach((item, index) => {
        const rect = item.element.getBoundingClientRect();
        const elementTop = rect.top + scrollY;

        // 画面の上部（100px以内）を通過している見出しを記録
        if (elementTop <= scrollY + 100) {
          readSetRef.current.add(item.id);
          if (index > lastReadIndexRef.current) {
            lastReadIndexRef.current = index;
          }
        }
      });

      updateProgress();
      updateActiveHeading(); // 初期化時にもアクティブな見出しを設定
    };

    // 初期化
    setTimeout(initializeReadSections, 100);

    // スクロール時にも進捗とアクティブな見出しを更新
    const handleScroll = () => {
      // アクティブな見出しを更新
      updateActiveHeading();

      const scrollY = window.scrollY;
      let updated = false;

      tocItems.forEach((item, index) => {
        const rect = item.element.getBoundingClientRect();
        const elementTop = rect.top + scrollY;

        // 画面の上部（100px以内）を通過している見出しを記録
        if (elementTop <= scrollY + 100 && !readSetRef.current.has(item.id)) {
          readSetRef.current.add(item.id);
          if (index > lastReadIndexRef.current) {
            lastReadIndexRef.current = index;
          }
          updated = true;
        }
      });

      if (updated) {
        updateProgress();
      }
    };

    // スクロールイベントをthrottleして追加
    let scrollTimeout: NodeJS.Timeout | null = null;
    const throttledHandleScroll = () => {
      if (scrollTimeout) return;
      scrollTimeout = setTimeout(() => {
        handleScroll();
        scrollTimeout = null;
      }, 50); // 50msごとに更新
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });

    tocItems.forEach(item => {
      observer.observe(item.element);
    });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', throttledHandleScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
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
    sectionProgress,
    readSections,
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
