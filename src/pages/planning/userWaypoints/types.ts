export type UserSavedWaypoint = {
  id: string;
  user_id: string;
  name: string;
  ident: string | null;
  memo: string | null;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
};

export type UserSavedWaypointInput = {
  name: string;
  ident?: string | null;
  memo?: string | null;
  latitude: number;
  longitude: number;
};
