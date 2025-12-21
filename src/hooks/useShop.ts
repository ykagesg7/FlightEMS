import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../utils/supabase';
import { useGamification } from './useGamification';
import type { Product } from '../types/engagement';

/**
 * useShop Hook
 * 商品一覧の取得とランクチェック
 */
export const useShop = () => {
  const { user } = useAuthStore();
  const { profile: gamificationProfile } = useGamification();

  // 商品一覧を取得
  const { data: products, isLoading, error } = useQuery<Product[], Error>({
    queryKey: ['shop', 'products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_available', true)
        .order('required_rank', { ascending: true })
        .order('price', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  // ユーザーのランクに基づいて購入可能な商品をフィルタリング
  const availableProducts = products?.filter((product) => {
    if (!gamificationProfile) return false;

    const rankOrder: Record<string, number> = {
      spectator: 1,
      trainee: 2,
      wingman: 3,
    };

    const userRankOrder = rankOrder[gamificationProfile.rank] || 0;
    const requiredRankOrder = rankOrder[product.required_rank] || 0;

    return userRankOrder >= requiredRankOrder;
  });

  // ロックされた商品（ランク不足）
  const lockedProducts = products?.filter((product) => {
    if (!gamificationProfile) return true;

    const rankOrder: Record<string, number> = {
      spectator: 1,
      trainee: 2,
      wingman: 3,
    };

    const userRankOrder = rankOrder[gamificationProfile.rank] || 0;
    const requiredRankOrder = rankOrder[product.required_rank] || 0;

    return userRankOrder < requiredRankOrder;
  });

  return {
    products: products || [],
    availableProducts: availableProducts || [],
    lockedProducts: lockedProducts || [],
    isLoading,
    error,
    userRank: gamificationProfile?.rank || 'spectator',
  };
};

