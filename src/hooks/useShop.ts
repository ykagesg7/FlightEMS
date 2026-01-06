import { useQuery } from '@tanstack/react-query';
import type { Product } from '../types/engagement';
import { supabase } from '../utils/supabase';
import { useGamification } from './useGamification';

/**
 * useShop Hook
 * 商品一覧の取得とランクチェック
 */
export const useShop = () => {
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

    // RANK_INFOに存在するランクのみを使用したランク順序
    const rankOrder: Partial<Record<string, number>> = {
      fan: 1,
      'ppl-aero-basics-phase1': 2,
      'ppl-aero-basics-phase2': 3,
      'ppl-aero-basics-master': 4,
      'ppl-aero-performance-phase1': 5,
      'ppl-aero-performance-phase2': 6,
      'ppl-aero-performance-master': 7,
      'ppl-aerodynamics-master': 8,
      'ppl-engineering-master': 9,
      ppl: 10,
      wingman: 11,
      cpl: 12,
      ace: 13,
      master: 14,
      legend: 15,
    };

    const userRankOrder = rankOrder[gamificationProfile.rank] || 0;
    const requiredRankOrder = rankOrder[product.required_rank] || 0;

    return userRankOrder >= requiredRankOrder;
  });

  // ロックされた商品（ランク不足）
  const lockedProducts = products?.filter((product) => {
    if (!gamificationProfile) return true;

    // RANK_INFOに存在するランクのみを使用したランク順序
    const rankOrder: Partial<Record<string, number>> = {
      fan: 1,
      'ppl-aero-basics-phase1': 2,
      'ppl-aero-basics-phase2': 3,
      'ppl-aero-basics-master': 4,
      'ppl-aero-performance-phase1': 5,
      'ppl-aero-performance-phase2': 6,
      'ppl-aero-performance-master': 7,
      'ppl-aerodynamics-master': 8,
      'ppl-engineering-master': 9,
      ppl: 10,
      wingman: 11,
      cpl: 12,
      ace: 13,
      master: 14,
      legend: 15,
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
    userRank: gamificationProfile?.rank || 'fan',
  };
};

