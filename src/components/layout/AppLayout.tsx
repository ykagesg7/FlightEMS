import React, { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useHideOnScroll } from '../../hooks/useHideOnScroll';
import { useAuthStore } from '../../stores/authStore';
import AvatarMenu from '../ui/AvatarMenu';
import { HUDTimeDisplay } from '../ui/HUDDashboard';
import ProgressIndicator from '../ui/ProgressIndicator';
// Theme toggler is integrated into AvatarMenu
import { HeaderSkeleton } from './HeaderSkeleton';

const learningCategories = [
  { name: '航空法規', key: 'aviation-law', icon: '' },
  { name: '計器飛行', key: 'instrument-flight', icon: '' },
  { name: '航空気象', key: 'aviation-weather', icon: '' },
  { name: 'システム', key: 'systems', icon: '' },
  { name: 'その他', key: 'others', icon: '' },
];

export const AppLayout: React.FC = () => {
  const [learningDropdownOpen, setLearningDropdownOpen] = useState(false);
  const { effectiveTheme } = useTheme();
  const navigate = useNavigate();
  const headerRef = useRef<HTMLElement | null>(null);
  const hidden = useHideOnScroll();
  const loading = useAuthStore(s => s.loading);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!learningDropdownOpen) return;
      const els = document.querySelectorAll('.relative.group');
      let inside = false;
      els.forEach((el) => { if (el.contains(e.target as Node)) inside = true; });
      if (!inside) setLearningDropdownOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [learningDropdownOpen]);

  useEffect(() => {
    const setVar = () => {
      const h = headerRef.current?.offsetHeight ?? 0;
      document.documentElement.style.setProperty('--header-h', `${h}px`);
    };
    setVar();
    const ro = new ResizeObserver(setVar);
    if (headerRef.current) ro.observe(headerRef.current);
    window.addEventListener('resize', setVar);
    return () => {
      window.removeEventListener('resize', setVar);
      ro.disconnect();
    };
  }, []);

  return (
    <div className={`min-h-screen ${effectiveTheme === 'day' ? 'bg-[#14213d]' : 'bg-black'} text-gray-100`}>
      <header
        ref={headerRef}
        className={`sticky top-0 z-50 border-b border-gray-700 bg-[color:var(--bg)]/80 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--bg)]/60 transition-transform duration-200 ${hidden ? '-translate-y-full' : 'translate-y-0'}`}
      >
        {loading ? (
          <HeaderSkeleton />
        ) : (
          <div className="container mx-auto px-4 py-4">
            <div className="hidden md:flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-extrabold tracking-wider hud-text">FLIGHT ACADEMY</h1>
                <HUDTimeDisplay />
              </div>
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-4">
                  <NavLink to="/" className="px-4 py-2 rounded-lg hover:bg-white/10 text-white">
                    <span className="hud-text">HOME</span>
                  </NavLink>
                  <NavLink to="/planning" className="px-4 py-2 rounded-lg hover:bg-white/10 text-white">
                    <span className="hud-text">PLANNING</span>
                  </NavLink>
                  <NavLink to="/articles" className="px-4 py-2 rounded-lg hover:bg-white/10 text-white">
                    <span className="hud-text">ARTICLES</span>
                  </NavLink>
                  <NavLink to="/learning" className="px-4 py-2 rounded-lg hover:bg-white/10 text-white">
                    <span className="hud-text">LESSONS</span>
                  </NavLink>
                  <NavLink to="/test" className="px-4 py-2 rounded-lg hover:bg-white/10 text-white">
                    <span className="hud-text">TEST</span>
                  </NavLink>
                </div>
                <div className="flex items-center gap-4">
                  <ProgressIndicator />
                  <AvatarMenu />
                </div>
              </div>
            </div>

            {/* Mobile Header (md:hidden) */}
            <div className="md:hidden flex items-center justify-between">
              <h1 className="text-lg font-bold tracking-wider hud-text">FLIGHT ACADEMY</h1>
              <div className="flex items-center gap-3">
                <AvatarMenu />
              </div>
            </div>
            <div className="md:hidden mt-3 -mx-2 px-2 overflow-x-auto whitespace-nowrap">
              <nav className="flex gap-2">
                <NavLink to="/" className="px-3 py-2 rounded-lg border hud-border hud-surface text-sm">
                  <span className="hud-text">HOME</span>
                </NavLink>
                <NavLink to="/planning" className="px-3 py-2 rounded-lg border hud-border hud-surface text-sm">
                  <span className="hud-text">PLANNING</span>
                </NavLink>
                <NavLink to="/articles" className="px-3 py-2 rounded-lg border hud-border hud-surface text-sm">
                  <span className="hud-text">ARTICLES</span>
                </NavLink>
                <NavLink to="/learning" className="px-3 py-2 rounded-lg border hud-border hud-surface text-sm">
                  <span className="hud-text">LESSONS</span>
                </NavLink>
                <NavLink to="/test" className="px-3 py-2 rounded-lg border hud-border hud-surface text-sm">
                  <span className="hud-text">TEST</span>
                </NavLink>
                <NavLink to="/account?tab=overview" className="px-3 py-2 rounded-lg border hud-border hud-surface text-sm">
                  <span className="hud-text">ACCOUNT</span>
                </NavLink>
              </nav>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
