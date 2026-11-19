import type { ReactNode } from 'react';

/** Fixed header clearance for in-article anchor scroll (matches layout `top-20`). */
export const MDX_HEADING_SCROLL_OFFSET_PX = 80;

export interface MdxTocHeading {
  id: string;
  text: string;
  level: number;
  element: HTMLElement;
}

export function isTocExcludedHeadingText(text: string): boolean {
  const trimmed = text.trim();
  return trimmed === '目次' || trimmed === 'Table of Contents';
}

export function assignHeadingAnchorId(ordinal: number, existingIds: Set<string>): string {
  let candidate = `heading-${ordinal}`;
  let counter = ordinal;
  while (existingIds.has(candidate)) {
    counter += 1;
    candidate = `heading-${counter}`;
  }
  existingIds.add(candidate);
  return candidate;
}

/**
 * Resolve a stable id for a heading rendered in React (skips TOC-title headings).
 */
export function resolveMdxHeadingId(
  propsId: string | undefined,
  headingText: string,
  ordinalState: { ordinal: number; existingIds: Set<string> },
): string | undefined {
  if (isTocExcludedHeadingText(headingText)) {
    return undefined;
  }
  const ordinal = ordinalState.ordinal;
  ordinalState.ordinal += 1;

  const existing = propsId?.trim() ?? '';
  if (/^heading-\d+$/.test(existing)) {
    ordinalState.existingIds.add(existing);
    return existing;
  }
  return assignHeadingAnchorId(ordinal, ordinalState.existingIds);
}

export function extractPlainTextFromReactChildren(children: ReactNode): string {
  if (children == null || typeof children === 'boolean') return '';
  if (typeof children === 'string' || typeof children === 'number') return String(children);
  if (Array.isArray(children)) {
    return children.map(extractPlainTextFromReactChildren).join('');
  }
  if (typeof children === 'object' && 'props' in children) {
    const el = children as { props?: { children?: ReactNode } };
    return extractPlainTextFromReactChildren(el.props?.children);
  }
  return '';
}

/**
 * Imperatively sync `heading-N` ids on live DOM (used when React has not set `id` yet, or ids were cleared on re-render).
 */
export function syncMdxHeadingAnchors(container: ParentNode): MdxTocHeading[] {
  const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const items: MdxTocHeading[] = [];
  const existingIds = new Set<string>();

  headings.forEach((heading) => {
    if (heading.id) {
      existingIds.add(heading.id);
    }
  });

  let headingOrdinal = 0;

  headings.forEach((heading) => {
    const element = heading as HTMLElement;
    const level = parseInt(element.tagName.charAt(1), 10);
    const text = element.textContent || '';
    if (isTocExcludedHeadingText(text)) {
      return;
    }

    const ordinal = headingOrdinal;
    headingOrdinal += 1;

    let id = element.id;
    if (!/^heading-\d+$/.test(id)) {
      id = assignHeadingAnchorId(ordinal, existingIds);
      element.id = id;
    }

    items.push({ id, text, level, element });
  });

  return items;
}

export function resolveMdxHeadingElement(
  container: ParentNode,
  id: string,
  cachedItems?: readonly MdxTocHeading[],
): HTMLElement | null {
  const byId = document.getElementById(id);
  if (byId && container.contains(byId)) {
    return byId;
  }

  const cached = cachedItems?.find((item) => item.id === id)?.element;
  if (cached?.isConnected && container.contains(cached)) {
    if (!cached.id) {
      cached.id = id;
    }
    return cached;
  }

  const synced = syncMdxHeadingAnchors(container);
  const syncedHit = synced.find((item) => item.id === id)?.element ?? document.getElementById(id);
  return syncedHit && container.contains(syncedHit) ? syncedHit : null;
}

export function scrollElementToAnchor(
  element: HTMLElement,
  options?: { offsetPx?: number; behavior?: ScrollBehavior },
): void {
  const headerOffset = options?.offsetPx ?? MDX_HEADING_SCROLL_OFFSET_PX;
  const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
  const offsetPosition = elementPosition - headerOffset;
  window.scrollTo({
    top: offsetPosition,
    behavior: options?.behavior ?? 'auto',
  });
}