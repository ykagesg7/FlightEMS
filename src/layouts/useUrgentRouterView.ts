import { useContext, useSyncExternalStore, type ContextType } from 'react';
import { UNSAFE_DataRouterContext, useLocation, type Location } from 'react-router-dom';

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

function subscribeRouter(router: DataRouter | undefined, onStoreChange: () => void): () => void {
  if (!router) {
    return () => {};
  }
  return router.subscribe(onStoreChange);
}

function readRouterLocation(router: DataRouter | undefined, fallback: Location): Location {
  return router?.state.location ?? fallback;
}

/**
 * Same-path search/hash updates are wrapped in startTransition, so useLocation and
 * useSearchParams can lag behind the address bar until POP or the transition commits.
 * Read router.state.location for query-driven UI (e.g. Planning ?mode=).
 */
export function useCommittedRouterLocation(): Location {
  const dataRouter = useContext(UNSAFE_DataRouterContext);
  const reactLocation = useLocation();
  const router = dataRouter?.router;

  return useSyncExternalStore(
    (onStoreChange) => subscribeRouter(router, onStoreChange),
    () => readRouterLocation(router, reactLocation),
    () => readRouterLocation(router, reactLocation),
  );
}
