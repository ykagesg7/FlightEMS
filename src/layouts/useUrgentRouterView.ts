import { useContext, useSyncExternalStore, type ContextType } from 'react';
import { UNSAFE_DataRouterContext, useLocation } from 'react-router-dom';

type DataRouter = NonNullable<
  ContextType<typeof UNSAFE_DataRouterContext>
>['router'];

function getViewSnapshot(router: DataRouter | undefined): string {
  if (!router) {
    return '';
  }
  const { navigation, location } = router.state;
  return [
    navigation.state,
    location.pathname,
    location.key,
    navigation.location?.pathname ?? '',
  ].join('\0');
}

/**
 * Read the data router outside startTransition.
 * useLocation/useNavigation stay on the previous page until the destination
 * tree commits; if that tree suspends, Planning remains on screen.
 */
export function useUrgentRouterView(): {
  leaving: boolean;
  locationKey: string;
} {
  const dataRouter = useContext(UNSAFE_DataRouterContext);
  const reactLocation = useLocation();
  const router = dataRouter?.router;

  const snapshot = useSyncExternalStore(
    (onStoreChange) => {
      if (!router) {
        return () => {};
      }
      return router.subscribe(() => {
        onStoreChange();
      });
    },
    () => getViewSnapshot(router),
    () => getViewSnapshot(router),
  );

  const [navState, storePath, storeKey, pendingPath] = snapshot.split('\0');
  const leaving =
    storePath !== reactLocation.pathname ||
    (navState !== 'idle' &&
      pendingPath !== '' &&
      pendingPath !== reactLocation.pathname);

  return {
    leaving,
    locationKey: storeKey || reactLocation.key,
  };
}
