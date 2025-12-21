import React from 'react';
import { motion } from 'framer-motion';
import { Lock, ExternalLink } from 'lucide-react';
import type { Product } from '../../types/engagement';
import type { UserRank } from '../../types/gamification';
import { RANK_INFO } from '../../types/gamification';

interface ProductCardProps {
  product: Product;
  userRank: UserRank;
  onPurchase?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, userRank, onPurchase }) => {
  const rankOrder: Record<UserRank, number> = {
    spectator: 1,
    trainee: 2,
    wingman: 3,
  };

  const userRankOrder = rankOrder[userRank] || 0;
  const requiredRankOrder = rankOrder[product.required_rank] || 0;
  const isLocked = userRankOrder < requiredRankOrder;

  const requiredRankInfo = RANK_INFO[product.required_rank];

  const handleClick = () => {
    if (!isLocked && product.external_link) {
      window.open(product.external_link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <motion.div
      className={`relative overflow-hidden rounded-lg border-2 transition-all duration-300 ${
        isLocked
          ? 'border-gray-700 bg-gray-800 cursor-not-allowed'
          : 'border-whiskyPapa-yellow/30 bg-whiskyPapa-black-light hover:border-whiskyPapa-yellow/60 cursor-pointer'
      }`}
      whileHover={isLocked ? {} : { scale: 1.02 }}
      whileTap={isLocked ? {} : { scale: 0.98 }}
      onClick={handleClick}
    >
      {/* ロックオーバーレイ */}
      {isLocked && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
          <Lock className="w-12 h-12 text-gray-400 mb-2" />
          <p className="text-white font-semibold text-sm mb-1">Rank {requiredRankInfo.displayName} Required</p>
          <p className="text-gray-400 text-xs">現在のランク: {RANK_INFO[userRank].displayName}</p>
        </div>
      )}

      {/* 商品画像 */}
      <div className="relative aspect-square w-full overflow-hidden bg-whiskyPapa-black">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-500">
            <span className="text-4xl">📦</span>
          </div>
        )}
      </div>

      {/* 商品情報 */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-white mb-1">{product.name}</h3>
        {product.description && (
          <p className="text-sm text-gray-400 mb-3 line-clamp-2">{product.description}</p>
        )}

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xl font-bold text-whiskyPapa-yellow">¥{product.price.toLocaleString()}</p>
            {product.stock_count !== null && (
              <p className="text-xs text-gray-500 mt-1">在庫: {product.stock_count}個</p>
            )}
          </div>

          {!isLocked && product.external_link && (
            <motion.button
              className="flex items-center gap-2 rounded-md bg-whiskyPapa-yellow px-4 py-2 text-sm font-bold text-whiskyPapa-black transition-colors hover:bg-whiskyPapa-yellow-light"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ExternalLink className="w-4 h-4" />
              購入する
            </motion.button>
          )}
        </div>

        {/* ランクバッジ */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-gray-500">必要ランク:</span>
          <span
            className="rounded-full px-2 py-1 text-xs font-semibold"
            style={{
              backgroundColor: `${requiredRankInfo.color}20`,
              color: requiredRankInfo.color,
            }}
          >
            {requiredRankInfo.icon} {requiredRankInfo.displayName}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

