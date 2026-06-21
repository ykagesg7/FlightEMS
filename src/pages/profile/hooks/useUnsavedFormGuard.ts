import { useEffect } from 'react';

const DEFAULT_MESSAGE = '変更が保存されていません。ページを離れますか？';

/**
 * Guards explicit-save profile forms on tab close / refresh.
 * In-app route blocking requires a data router (createBrowserRouter); not used with BrowserRouter.
 */
export function useUnsavedFormGuard(
  isDirty: boolean,
  _message: string = DEFAULT_MESSAGE,
): void {
  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);
}
