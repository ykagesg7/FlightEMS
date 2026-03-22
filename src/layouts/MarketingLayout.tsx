import { AnimatePresence, motion } from 'framer-motion';
import React, { useRef, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { UserMenu } from '../components/marketing/UserMenu';
import { Typography } from '../components/ui';
import { HUDTimeDisplay } from '../components/ui/HUDDashboard';
import { useMobileNavFocusTrap } from '../hooks/useMobileNavFocusTrap';

const navLinkDesktop = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors lg:px-4 lg:text-sm',
    isActive
      ? 'bg-brand-primary/15 text-brand-primary'
      : 'text-[var(--text-primary)] hover:bg-brand-primary/10',
  ].join(' ');

const navLinkMobile = ({ isActive }: { isActive: boolean }) =>
  [
    'block rounded-lg px-4 py-3 transition-colors',
    isActive
      ? 'bg-brand-primary/15 text-brand-primary'
      : 'text-[var(--text-primary)] hover:bg-brand-primary/10',
  ].join(' ');

/**
 * MarketingLayout
 * Flight Academy Cockpit Academy テーマ
 * ネイビー×エアフォースブルー基調
 */
export const MarketingLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileNavPanelRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useMobileNavFocusTrap({
    open: isMobileMenuOpen,
    containerRef: mobileNavPanelRef,
    restoreFocusRef: menuButtonRef,
    onClose: () => setIsMobileMenuOpen(false),
  });

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-brand-primary/20 bg-[var(--bg)]/95 backdrop-blur-md">
        <div className="container mx-auto px-3 py-2 sm:px-4 md:py-2.5">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            {/* 左: ロゴ＋ワードマーク＋タグライン＋HUD */}
            <div className="flex min-w-0 items-center">
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-2 sm:gap-3 md:gap-4"
              >
                <NavLink
                  to="/"
                  end
                  className="group flex min-w-0 items-center gap-2 sm:gap-2.5 rounded-md outline-none ring-brand-primary/40 focus-visible:ring-2"
                  aria-label="Flight Academy home"
                >
                  <span
                    className="shrink-0 rounded-lg bg-[color-mix(in_srgb,var(--panel)_70%,transparent)] p-0.5 ring-1 ring-brand-primary/25"
                    aria-hidden
                  >
                    <img
                      src="/F2favicon.png"
                      alt=""
                      width={56}
                      height={56}
                      className="h-10 w-10 shrink-0 object-contain sm:h-11 sm:w-11 md:h-12 md:w-12"
                      decoding="async"
                    />
                  </span>
                  <div className="hidden min-w-0 flex-col justify-center min-[380px]:flex">
                    <Typography
                      variant="caption"
                      className="!text-xs !font-bold !leading-tight !tracking-wide text-brand-primary transition-colors group-hover:text-brand-primary sm:!text-sm"
                    >
                      Flight Academy
                    </Typography>
                    <Typography
                      variant="caption"
                      className="!mt-0.5 !text-[0.625rem] !font-bold !leading-tight !tracking-[0.12em] !text-brand-primary/80 transition-colors group-hover:!text-brand-primary sm:!text-[0.6875rem] md:!text-xs"
                    >
                      Learn Smart.
                    </Typography>
                  </div>
                </NavLink>
                <div
                  className="hidden h-8 w-px shrink-0 bg-brand-primary/20 md:block"
                  aria-hidden
                />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25, delay: 0.08 }}
                  className="hidden md:block"
                >
                  <HUDTimeDisplay textAlign="start" density="compact" />
                </motion.div>
              </motion.div>
            </div>

            {/* Navigation — ヘッダー帯と同じコンパクトなタップ領域 */}
            <nav className="hidden items-center gap-1 md:flex lg:gap-2" aria-label="Main">
              <NavLink to="/" end className={navLinkDesktop}>
                HOME
              </NavLink>
              <NavLink to="/articles" className={navLinkDesktop}>
                ARTICLES
              </NavLink>
              <NavLink to="/planning" className={navLinkDesktop}>
                PLANNING
              </NavLink>
              <NavLink to="/test" className={navLinkDesktop}>
                QUIZ
              </NavLink>
            </nav>

            {/* User Menu / Login Button */}
            <div className="hidden items-center md:flex">
              <UserMenu />
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 md:hidden">
              <UserMenu />
              <button
                ref={menuButtonRef}
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="rounded-lg p-2 text-brand-primary transition-colors hover:bg-brand-primary/10"
                aria-label={isMobileMenuOpen ? 'メニューを閉じる' : 'メニューを開く'}
                aria-expanded={isMobileMenuOpen}
                aria-controls="marketing-mobile-nav"
              >
                {isMobileMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              id="marketing-mobile-nav"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden border-b border-brand-primary/20 bg-[var(--bg)]/95 backdrop-blur-md md:hidden"
            >
              <div ref={mobileNavPanelRef} className="container mx-auto px-4 py-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 }}
                  className="mb-4"
                >
                  <HUDTimeDisplay />
                </motion.div>
                <nav className="flex flex-col gap-2" aria-label="Mobile main">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <NavLink
                      to="/"
                      end
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={navLinkMobile}
                    >
                      HOME
                    </NavLink>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <NavLink
                      to="/articles"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={navLinkMobile}
                    >
                      ARTICLES
                    </NavLink>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <NavLink
                      to="/planning"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={navLinkMobile}
                    >
                      PLANNING
                    </NavLink>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <NavLink
                      to="/test"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={navLinkMobile}
                    >
                      QUIZ
                    </NavLink>
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
      <footer className="border-t border-brand-primary/20 bg-[var(--panel)] py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
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
                  <NavLink
                    to="/auth"
                    className="text-sm text-gray-400 transition-colors hover:text-brand-primary"
                  >
                    Login / Sign up
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/profile"
                    className="text-sm text-gray-400 transition-colors hover:text-brand-primary"
                  >
                    Profile
                  </NavLink>
                </li>
              </ul>
            </div>
            <div>
              <Typography variant="h4" className="mb-4">
                Core Modules
              </Typography>
              <ul className="space-y-2">
                <li>
                  <NavLink
                    to="/planning"
                    className="text-sm text-gray-400 transition-colors hover:text-brand-primary"
                  >
                    Flight Planning
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/articles"
                    className="text-sm text-gray-400 transition-colors hover:text-brand-primary"
                  >
                    Articles
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/test"
                    className="text-sm text-gray-400 transition-colors hover:text-brand-primary"
                  >
                    Quiz
                  </NavLink>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-brand-primary/10 pt-8 text-center">
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
