import { AnimatePresence, motion } from 'framer-motion';
import { Plane } from 'lucide-react';
import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { UserMenu } from '../components/marketing/UserMenu';
import { Typography } from '../components/ui';
import { HUDTimeDisplay } from '../components/ui/HUDDashboard';

/**
 * MarketingLayout
 * Flight Academy Cockpit Academy テーマ
 * ネイビー×エアフォースブルー基調
 */
export const MarketingLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--bg)]/90 backdrop-blur-md border-b border-brand-primary/20">
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
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/20 border border-brand-primary/40">
                    <Plane className="h-5 w-5 text-brand-primary" strokeWidth={2.5} aria-hidden />
                  </div>
                  <div className="flex flex-col">
                    <Typography variant="h4" className="!text-lg !font-bold leading-tight">
                      Flight Academy
                    </Typography>
                    <Typography variant="caption" className="!text-xs !text-brand-primary/80 !font-medium tracking-wider uppercase">
                      Learn Smart.
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

            {/* Navigation - Flight Academy: HOME, BLOG, PLANNING, QUIZ */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/"
                className="px-4 py-2 rounded-lg hover:bg-brand-primary/10 text-[var(--text-primary)] transition-colors"
              >
                HOME
              </Link>
              <Link
                to="/articles"
                className="px-4 py-2 rounded-lg hover:bg-brand-primary/10 text-[var(--text-primary)] transition-colors"
              >
                BLOG
              </Link>
              <Link
                to="/planning"
                className="px-4 py-2 rounded-lg hover:bg-brand-primary/10 text-[var(--text-primary)] transition-colors"
              >
                PLANNING
              </Link>
              <Link
                to="/test"
                className="px-4 py-2 rounded-lg hover:bg-brand-primary/10 text-[var(--text-primary)] transition-colors"
              >
                QUIZ
              </Link>
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
                className="p-2 text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
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
              className="md:hidden overflow-hidden bg-[var(--bg)]/95 backdrop-blur-md border-b border-brand-primary/20"
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
                      className="block px-4 py-3 rounded-lg hover:bg-brand-primary/10 text-[var(--text-primary)] transition-colors"
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
                      to="/articles"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg hover:bg-brand-primary/10 text-[var(--text-primary)] transition-colors"
                    >
                      BLOG
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Link
                      to="/planning"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg hover:bg-brand-primary/10 text-[var(--text-primary)] transition-colors"
                    >
                      PLANNING
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <Link
                      to="/test"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg hover:bg-brand-primary/10 text-[var(--text-primary)] transition-colors"
                    >
                      QUIZ
                    </Link>
                  </motion.div>
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
      <footer className="bg-[var(--panel)] border-t border-brand-primary/20 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <Typography variant="h3" color="brand" className="mb-4">
                Flight Academy
              </Typography>
              <Typography variant="body-sm" color="muted">
                Learn Smart.
              </Typography>
              <Typography variant="body-sm" color="muted" className="mt-2">
                学習・試験対策・フライトプランニングを、ひとつの流れで。
              </Typography>
            </div>
            <div>
              <Typography variant="h4" className="mb-4">
                Platform
              </Typography>
              <ul className="space-y-2">
                <li>
                  <Link to="/auth" className="text-sm text-gray-400 hover:text-brand-primary transition-colors">
                    Login / Sign up
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className="text-sm text-gray-400 hover:text-brand-primary transition-colors">
                    Profile
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <Typography variant="h4" className="mb-4">
                Core Modules
              </Typography>
              <ul className="space-y-2">
                <li>
                  <Link to="/planning" className="text-sm text-gray-400 hover:text-brand-primary transition-colors">
                    Flight Planning
                  </Link>
                </li>
                <li>
                  <Link to="/articles" className="text-sm text-gray-400 hover:text-brand-primary transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to="/test" className="text-sm text-gray-400 hover:text-brand-primary transition-colors">
                    Quiz
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-brand-primary/10 text-center">
            <Typography variant="caption" color="muted">
              &copy; {new Date().getFullYear()} Flight Academy. All rights reserved.
            </Typography>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MarketingLayout;

