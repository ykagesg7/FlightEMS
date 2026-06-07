import type { Profile } from '../stores/authStore';

export function isAdminUser(profile: Pick<Profile, 'roll'> | null | undefined): boolean {
  return profile?.roll?.toLowerCase() === 'admin';
}
