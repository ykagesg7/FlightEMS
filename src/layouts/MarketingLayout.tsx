import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Typography } from '../components/ui';
import { UserMenu } from '../components/marketing/UserMenu';
import { HUDTimeDisplay } from '../components/ui/HUDDashboard';
import { useAuthStore } from '../stores/authStore';

/**
 * MarketingLayout
 * Whisky Papaブランド用の広報レイアウト
 * 黒×黄色基調、Framer Motionを使用したアニメーション
 */
export const MarketingLayout: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-whiskyPapa-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-whiskyPapa-black/90 backdrop-blur-md border-b border-whiskyPapa-yellow/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and HUD Time Display (logged in only) */}
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Link to="/" className="flex items-center gap-3">
                  <Typography variant="h2" color="brand" className="!text-2xl">
                    WP
                  </Typography>
                  <Typography variant="h4" className="!text-lg">
                    Whisky Papa
                  </Typography>
                </Link>
              </motion.div>
              {/* HUD Time Display - Only shown when logged in */}
              {user && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="hidden md:block"
                >
                  <HUDTimeDisplay />
                </motion.div>
              )}
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
              <button className="p-2 text-whiskyPapa-yellow">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
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
                  <Link to="/learning" className="text-sm text-gray-400 hover:text-brand-primary transition-colors">
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

