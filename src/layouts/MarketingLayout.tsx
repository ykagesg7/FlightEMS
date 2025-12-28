import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { UserMenu } from '../components/marketing/UserMenu';
import { Typography } from '../components/ui';
import { HUDTimeDisplay } from '../components/ui/HUDDashboard';
import { useAuthStore } from '../stores/authStore';

/**
 * MarketingLayout
 * Whisky Papaブランド用の広報レイアウト
 * 黒×黄色基調、Framer Motionを使用したアニメーション
 */
export const MarketingLayout: React.FC = () => {
  const { user } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-whiskyPapa-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-whiskyPapa-black/90 backdrop-blur-md border-b border-whiskyPapa-yellow/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and HUD Time Display */}
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Link to="/" className="flex items-center gap-3">
                  <img
                    src="/images/ContentImages/Home/yellow-robin-logo.png"
                    alt="Yellow Robin"
                    className="h-10 w-10 object-contain"
                  />
                  <div className="flex flex-col">
                    <Typography variant="h4" className="!text-lg !font-bold leading-tight">
                      Whisky Papa
                    </Typography>
                    <Typography variant="caption" className="!text-xs !text-whiskyPapa-yellow/80 !font-medium tracking-wider uppercase">
                      Competition Aerobatic Team
                    </Typography>
                  </div>
                </Link>
              </motion.div>
              {/* HUD Time Display - Always shown */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="hidden md:block"
              >
                <HUDTimeDisplay />
              </motion.div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/"
                className="px-4 py-2 rounded-lg hover:bg-whiskyPapa-yellow/10 text-white transition-colors"
              >
                HOME
              </Link>
              <Link
                to="/about"
                className="px-4 py-2 rounded-lg hover:bg-whiskyPapa-yellow/10 text-white transition-colors"
              >
                ABOUT
              </Link>
              <Link
                to="/gallery"
                className="px-4 py-2 rounded-lg hover:bg-whiskyPapa-yellow/10 text-white transition-colors"
              >
                GALLERY
              </Link>
              <Link
                to="/shop"
                className="px-4 py-2 rounded-lg hover:bg-whiskyPapa-yellow/10 text-white transition-colors"
              >
                SHOP
              </Link>
              <Link
                to="/schedule"
                className="px-4 py-2 rounded-lg hover:bg-whiskyPapa-yellow/10 text-white transition-colors"
              >
                SCHEDULE
              </Link>
              {/* MISSION Link - Only shown when logged in */}
              {user && (
                <Link
                  to="/mission"
                  className="px-4 py-2 rounded-lg hover:bg-whiskyPapa-yellow/10 text-white transition-colors"
                >
                  MISSION
                </Link>
              )}
            </nav>

            {/* User Menu / Login Button */}
            <div className="hidden md:flex items-center">
              <UserMenu />
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <UserMenu />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-whiskyPapa-yellow hover:bg-whiskyPapa-yellow/10 rounded-lg transition-colors"
                aria-label="メニューを開く"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden bg-whiskyPapa-black/95 backdrop-blur-md border-b border-whiskyPapa-yellow/20"
            >
              <div className="container mx-auto px-4 py-4">
                {/* HUD Time Display - Always shown */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 }}
                  className="mb-4"
                >
                  <HUDTimeDisplay />
                </motion.div>
                <nav className="flex flex-col gap-2">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Link
                      to="/"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg hover:bg-whiskyPapa-yellow/10 text-white transition-colors"
                    >
                      HOME
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <Link
                      to="/about"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg hover:bg-whiskyPapa-yellow/10 text-white transition-colors"
                    >
                      ABOUT
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Link
                      to="/gallery"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg hover:bg-whiskyPapa-yellow/10 text-white transition-colors"
                    >
                      GALLERY
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <Link
                      to="/shop"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg hover:bg-whiskyPapa-yellow/10 text-white transition-colors"
                    >
                      SHOP
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Link
                      to="/schedule"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg hover:bg-whiskyPapa-yellow/10 text-white transition-colors"
                    >
                      SCHEDULE
                    </Link>
                  </motion.div>
                  {/* MISSION Link - Only shown when logged in */}
                  {user && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 }}
                    >
                      <Link
                        to="/mission"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-4 py-3 rounded-lg hover:bg-whiskyPapa-yellow/10 text-white transition-colors"
                      >
                        MISSION
                      </Link>
                    </motion.div>
                  )}
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-whiskyPapa-black-dark border-t border-whiskyPapa-yellow/20 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <Typography variant="h3" color="brand" className="mb-4">
                Whisky Papa
              </Typography>
              <Typography variant="body-sm" color="muted">
                エアロバティックチーム「ウイスキーパパ」公式サイト
              </Typography>
            </div>
            <div>
              <Typography variant="h4" className="mb-4">
                Quick Links
              </Typography>
              <ul className="space-y-2">
                <li>
                  <Link to="/about" className="text-sm text-gray-400 hover:text-brand-primary transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/gallery" className="text-sm text-gray-400 hover:text-brand-primary transition-colors">
                    Gallery
                  </Link>
                </li>
                <li>
                  <Link to="/shop" className="text-sm text-gray-400 hover:text-brand-primary transition-colors">
                    Shop
                  </Link>
                </li>
                <li>
                  <Link to="/schedule" className="text-sm text-gray-400 hover:text-brand-primary transition-colors">
                    Schedule
                  </Link>
                </li>
                <li>
                  <Link to="/links" className="text-sm text-gray-400 hover:text-brand-primary transition-colors">
                    Links
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <Typography variant="h4" className="mb-4">
                Tools
              </Typography>
              <ul className="space-y-2">
                <li>
                  <Link to="/planning" className="text-sm text-gray-400 hover:text-brand-primary transition-colors">
                    Flight Planner
                  </Link>
                </li>
                <li>
                  <Link to="/articles" className="text-sm text-gray-400 hover:text-brand-primary transition-colors">
                    Academy
                  </Link>
                </li>
                <li>
                  <Link to="/test" className="text-sm text-gray-400 hover:text-brand-primary transition-colors">
                    CPL Quiz
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-whiskyPapa-yellow/10 text-center">
            <Typography variant="caption" color="muted">
              &copy; {new Date().getFullYear()} Whisky Papa. All rights reserved.
            </Typography>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MarketingLayout;

