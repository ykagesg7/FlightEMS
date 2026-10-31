import { useAuthStore } from '../stores/authStore';
import { purgeInvalidAuthStorage } from './readStoredRefreshToken';

/** 起動時: 無効ストレージを除去してから refreshSession を1回だけ実行。 */
export async function bootstrapAuthSession(): Promise<void> {
  purgeInvalidAuthStorage();
  await useAuthStore.getState().refreshSession();
}
