import { useAuth } from '../../../hooks/useAuth';

/**
 * Pro entitlement for Google Photorealistic 3D tiles.
 * Pop-out and in-page viewer must share this hook so auth persists via zustand.
 */
export function useFlightViewer3dProUser(): boolean {
  const { user, profile } = useAuth();
  void user;
  void profile;
  // Billing / subscription field not wired yet; keep in sync with product when added.
  return false;
}
