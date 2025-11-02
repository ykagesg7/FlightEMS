import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import type { Database } from '../types/database.types';

type Announcement = Database['public']['Tables']['announcements']['Row'];

interface UseAnnouncementsReturn {
  announcements: Announcement[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Supabaseからお知らせを取得するフック
 * 最新5件を日付の降順で取得
 */
export function useAnnouncements(): UseAnnouncementsReturn {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchAnnouncements = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('announcements')
          .select('*')
          .order('date', { ascending: false })
          .limit(5);

        if (fetchError) {
          throw fetchError;
        }

        if (isMounted) {
          const announcementsData = data || [];
          setAnnouncements(announcementsData);
          if (process.env.NODE_ENV === 'development') {
            console.log('お知らせ取得完了:', announcementsData.length, '件', announcementsData);
          }
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'お知らせの取得に失敗しました';
          setError(new Error(errorMessage));
          console.error('お知らせ取得エラー:', err);
          if (process.env.NODE_ENV === 'development') {
            console.error('エラー詳細:', {
              error: err,
              message: errorMessage,
              timestamp: new Date().toISOString(),
            });
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchAnnouncements();

    return () => {
      isMounted = false;
    };
  }, []);

  return { announcements, isLoading, error };
}

