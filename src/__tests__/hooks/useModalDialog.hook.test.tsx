import { useModalDialog } from '@/hooks/useModalDialog';
import { lockBodyScroll } from '@/utils/modalScrollLock';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef, useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

function DialogHarness({
  initialOpen = true,
  closeOnEscape = true,
}: {
  initialOpen?: boolean;
  closeOnEscape?: boolean;
}) {
  const [open, setOpen] = useState(initialOpen);
  const dialogRef = useRef<HTMLDivElement>(null);

  useModalDialog({
    open,
    onClose: () => setOpen(false),
    containerRef: dialogRef,
    closeOnEscape,
  });

  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>
        開く
      </button>
      {open ? (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="dlg-title"
        >
          <h2 id="dlg-title">テストダイアログ</h2>
          <button type="button">最初</button>
          <button type="button">二番目</button>
          <button type="button" onClick={() => setOpen(false)}>
            閉じる
          </button>
        </div>
      ) : null}
    </div>
  );
}

describe('useModalDialog', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-modal-scroll-locked');
  });

  it('sets scroll lock attribute while open', () => {
    render(<DialogHarness />);
    expect(document.documentElement.getAttribute('data-modal-scroll-locked')).toBe('');
  });

  it('removes scroll lock when closed', async () => {
    const user = userEvent.setup();
    render(<DialogHarness />);
    await user.click(screen.getByRole('button', { name: '閉じる' }));
    expect(document.documentElement.hasAttribute('data-modal-scroll-locked')).toBe(false);
  });

  it('calls onClose on Escape', async () => {
    render(<DialogHarness />);
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('returns focus to the opener when closed', async () => {
    const user = userEvent.setup();
    render(<DialogHarness initialOpen={false} />);
    const opener = screen.getByRole('button', { name: '開く' });
    await user.click(opener);
    await user.click(screen.getByRole('button', { name: '閉じる' }));
    expect(opener).toHaveFocus();
  });

  it('cycles Tab between focusable elements inside the dialog', async () => {
    const user = userEvent.setup();
    render(<DialogHarness />);
    const buttons = screen.getAllByRole('button');
    const dialogButtons = buttons.filter((b) => b.textContent !== '開く');
    expect(dialogButtons[0]).toHaveFocus();
    await user.tab();
    expect(dialogButtons[1]).toHaveFocus();
    await user.tab();
    expect(dialogButtons[2]).toHaveFocus();
    await user.tab();
    expect(dialogButtons[0]).toHaveFocus();
  });

  it('ref-counts scroll lock', () => {
    const unlockA = lockBodyScroll();
    const unlockB = lockBodyScroll();
    expect(document.documentElement.getAttribute('data-modal-scroll-locked')).toBe('');
    unlockA();
    expect(document.documentElement.getAttribute('data-modal-scroll-locked')).toBe('');
    unlockB();
    expect(document.documentElement.hasAttribute('data-modal-scroll-locked')).toBe(false);
  });
});