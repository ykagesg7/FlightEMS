import { motion } from 'framer-motion';
import React from 'react';
import { RankBadge } from '../../components/marketing/RankBadge';
import { useGamification } from '../../hooks/useGamification';
import { useShop } from '../../hooks/useShop';
import { ProductCard } from './components/ProductCard';

const Shop: React.FC = () => {
  const { products, availableProducts, lockedProducts, isLoading, userRank } = useShop();
  const { profile: gamificationProfile } = useGamification();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-whiskyPapa-black text-white flex items-center justify-center p-4">
        <div className="text-whiskyPapa-yellow text-xl animate-pulse">Loading Shop...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-whiskyPapa-black text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <motion.div
          className="mb-10 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-whiskyPapa-yellow mb-4">THE HANGAR STORE</h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            ランクに応じた限定グッズを販売しています。ランクを上げて、より多くの商品にアクセスしましょう。
          </p>

          {/* ユーザーランク表示 */}
          {gamificationProfile && (
            <div className="mt-6 flex justify-center">
              <RankBadge rank={gamificationProfile.rank} size="md" showLabel={true} animated={true} />
            </div>
          )}
        </motion.div>

        {/* 購入可能な商品 */}
        {availableProducts.length > 0 && (
          <motion.section
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-whiskyPapa-yellow mb-6">購入可能な商品</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {availableProducts.map((product) => (
                <ProductCard key={product.id} product={product} userRank={userRank} />
              ))}
            </div>
          </motion.section>
        )}

        {/* ロックされた商品 */}
        {lockedProducts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-gray-400 mb-6">ランクアップで解禁</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {lockedProducts.map((product) => (
                <ProductCard key={product.id} product={product} userRank={userRank} />
              ))}
            </div>
          </motion.section>
        )}

        {/* 商品がない場合 */}
        {products.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">現在、商品がありません。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;

