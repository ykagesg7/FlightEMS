import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import type { UserSavedWaypoint, UserSavedWaypointInput } from './types';
import {
  createUserSavedWaypoint,
  deleteUserSavedWaypoint,
  listUserSavedWaypoints,
  updateUserSavedWaypoint,
} from './userSavedWaypointsApi';

export function useUserSavedWaypoints() {
  const { user, isAuthenticated } = useAuth();
  const [rows, setRows] = useState<UserSavedWaypoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setRows([]);
      return;
    }
    setLoading(true);
    setLastError(null);
    const list = await listUserSavedWaypoints(user.id);
    setRows(list);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const savePoint = useCallback(
    async (input: UserSavedWaypointInput) => {
      if (!user?.id) {
        return { row: null, error: 'ログインするとマイポイントを保存できます' };
      }
      const result = await createUserSavedWaypoint(user.id, input);
      if (result.row) {
        setRows((prev) => [result.row!, ...prev.filter((r) => r.id !== result.row!.id)]);
      }
      if (result.error) setLastError(result.error);
      return result;
    },
    [user?.id],
  );

  const renamePoint = useCallback(
    async (id: string, name: string) => {
      if (!user?.id) return { ok: false, error: 'ログインが必要です' };
      const result = await updateUserSavedWaypoint(user.id, id, { name });
      if (result.ok) {
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, name: name.trim() } : r)));
      } else if (result.error) setLastError(result.error);
      return result;
    },
    [user?.id],
  );

  const removePoint = useCallback(
    async (id: string) => {
      if (!user?.id) return { ok: false, error: 'ログインが必要です' };
      const result = await deleteUserSavedWaypoint(user.id, id);
      if (result.ok) setRows((prev) => prev.filter((r) => r.id !== id));
      else if (result.error) setLastError(result.error);
      return result;
    },
    [user?.id],
  );

  return {
    rows,
    loading,
    lastError,
    isAuthenticated,
    refresh,
    savePoint,
    renamePoint,
    removePoint,
  };
}
