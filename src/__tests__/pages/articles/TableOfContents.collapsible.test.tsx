import TableOfContents from '@/pages/articles/components/TableOfContents';
import { runAfterDomLayoutSettle } from '@/utils/mdxHeadingAnchors';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const scrollToHeading = vi.fn();

vi.mock('@/hooks/useTableOfContents', () => ({
  useTableOfContents: () => ({
    tocItems: [
      { id: 'heading-0', text: '最初の章', level: 2, element: document.createElement('h2') },
      { id: 'heading-1', text: '次の章', level: 2, element: document.createElement('h2') },
    ],
    activeId: '',
    scrollToHeading,
  }),
}));

describe('TableOfContents collapsible-top', () => {
  afterEach(() => {
    scrollToHeading.mockClear();
    vi.restoreAllMocks();
  });

  it('closes <details> then scrolls after layout settle', () => {
    const rafQueue: FrameRequestCallback[] = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      rafQueue.push(cb);
      return rafQueue.length;
    });

    const container = document.createElement('div');
    container.className = 'mdx-container';
    document.body.appendChild(container);

    const { container: view } = render(<TableOfContents mode="collapsible-top" compact />);

    const details = view.querySelector('details.toc-collapsible-top');
    expect(details).not.toBeNull();
    if (details instanceof HTMLDetailsElement) {
      details.open = true;
    }

    fireEvent.click(screen.getByRole('button', { name: '最初の章' }));

    expect(details).toBeInstanceOf(HTMLDetailsElement);
    expect((details as HTMLDetailsElement).open).toBe(false);
    expect(scrollToHeading).not.toHaveBeenCalled();
    expect(rafQueue).toHaveLength(1);

    rafQueue.shift()?.(0);
    expect(scrollToHeading).not.toHaveBeenCalled();
    expect(rafQueue).toHaveLength(1);

    rafQueue.shift()?.(0);
    expect(scrollToHeading).toHaveBeenCalledWith('heading-0');

    container.remove();
  });
});

describe('runAfterDomLayoutSettle', () => {
  it('invokes callback after two animation frames', () => {
    const cb = vi.fn();
    const stored: FrameRequestCallback[] = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((fn: FrameRequestCallback) => {
      stored.push(fn);
      return stored.length;
    });

    runAfterDomLayoutSettle(cb);
    expect(cb).not.toHaveBeenCalled();
    expect(stored).toHaveLength(1);
    stored[0](0);
    expect(cb).not.toHaveBeenCalled();
    expect(stored).toHaveLength(2);
    stored[1](0);
    expect(cb).toHaveBeenCalledOnce();

    vi.restoreAllMocks();
  });
});