import { useEffect, useState } from 'react';
import {
  getGuestHomeLatestItems,
  type GuestHomeLatestItem,
} from '../utils/guestHomeLatestItems';

interface UseGuestHomeLatestItemsReturn {
  items: GuestHomeLatestItem[];
  isLoading: boolean;
  error: Error | null;
}

export function useGuestHomeLatestItems(): UseGuestHomeLatestItemsReturn {
  const [items, setItems] = useState<GuestHomeLatestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const latest = await getGuestHomeLatestItems();
        if (isMounted) {
          setItems(latest);
        }
      } catch (err) {
        if (isMounted) {
          const message =
            err instanceof Error ? err.message : '最新情報の取得に失敗しました';
          setError(new Error(message));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  return { items, isLoading, error };
}
