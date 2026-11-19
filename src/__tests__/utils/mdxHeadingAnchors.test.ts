import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getPreferredScrollBehavior } from '@/utils/preferredScrollBehavior';
import {
  MDX_HEADING_SCROLL_OFFSET_PX,
  resolveMdxHeadingElement,
  scrollElementToAnchor,
  syncMdxHeadingAnchors,
} from '@/utils/mdxHeadingAnchors';

describe('mdxHeadingAnchors', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.className = 'mdx-container';
    document.body.appendChild(container);
    window.scrollTo = vi.fn();
  });

  afterEach(() => {
    container.remove();
    vi.restoreAllMocks();
  });

  it('syncMdxHeadingAnchors assigns heading-N ids and skips 目次', () => {
    container.innerHTML = `
      <h2>はじめに</h2>
      <h2>目次</h2>
      <h3>詳細</h3>
    `;
    const items = syncMdxHeadingAnchors(container);
    expect(items.map((i) => i.id)).toEqual(['heading-0', 'heading-1']);
    expect(container.querySelector('h2#heading-0')?.textContent).toContain('はじめに');
    const tocTitle = Array.from(container.querySelectorAll('h2')).find((el) =>
      el.textContent?.includes('目次'),
    );
    expect(tocTitle?.id).toBe('');
    expect(container.querySelector('h3#heading-1')).not.toBeNull();
  });

  it('resolveMdxHeadingElement finds heading after React-style id removal', () => {
    container.innerHTML = `<h2 id="heading-0">本文</h2><h2 id="heading-1">後半</h2>`;
    syncMdxHeadingAnchors(container);
    const items = syncMdxHeadingAnchors(container);

    container.querySelectorAll('h2').forEach((heading) => {
      heading.removeAttribute('id');
    });
    expect(document.getElementById('heading-1')).toBeNull();

    const target = resolveMdxHeadingElement(container, 'heading-1', items);
    expect(target).not.toBeNull();
    expect(target?.textContent).toContain('後半');
    expect(target?.id).toBe('heading-1');
  });

  it('scrollElementToAnchor scrolls with header offset and hash-friendly position', () => {
    const heading = document.createElement('h2');
    heading.id = 'heading-0';
    heading.textContent = 'ターゲット';
    container.appendChild(heading);
    vi.spyOn(heading, 'getBoundingClientRect').mockReturnValue({
      top: 200,
      left: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    Object.defineProperty(window, 'pageYOffset', { value: 100, configurable: true });

    scrollElementToAnchor(heading, {
      offsetPx: MDX_HEADING_SCROLL_OFFSET_PX,
      behavior: 'auto',
    });

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 220,
      behavior: 'auto',
    });
  });
});

describe('getPreferredScrollBehavior with reduced motion', () => {
  it('uses auto when prefers-reduced-motion is reduce', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('reduce'),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
    expect(getPreferredScrollBehavior()).toBe('auto');
    vi.unstubAllGlobals();
  });
});