import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

interface CategoryDropdownProps {
  categories: { name: string; key: string; icon: string }[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  basePath: string;
  setMobileMenuOpen?: (open: boolean) => void; // モバイルでのみ使用
  isMilitary: boolean;
  isMobileView?: boolean; // モバイルビューかどうかを区別するため
}

export const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
  categories,
  isOpen,
  setIsOpen,
  basePath,
  setMobileMenuOpen,
  isMilitary,
  isMobileView = false,
}) => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryKey: string) => {
    setIsOpen(false);
    if (setMobileMenuOpen) setMobileMenuOpen(false);
    navigate(`${basePath}?category=${categoryKey}`);
  };

  return (
    <div
      className={isMobileView ? "ml-4 mt-2 space-y-1 border-l-2 border-white/20 pl-4" : "absolute top-full left-0 mt-1 w-64 bg-black/90 rounded-xl shadow-2xl border border-gray-200/20 dark:border-gray-700/50 backdrop-blur-sm z-50 overflow-hidden"}
    >
      <div className="p-2">
        <div className="text-xs font-semibold px-3 py-2 uppercase tracking-wider text-gray-500 dark:text-gray-400">
          ▶ CATEGORIES
        </div>
        {categories.map((category) => (
          <button
            key={category.key}
            onClick={() => handleCategoryClick(category.key)}
            className={`w-full text-left px-3 py-3 transition-all duration-200 group/item ${isMilitary
              ? 'hud-button border-none rounded-none hover:bg-hud-dim'
              : 'rounded-lg hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30'
              }`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg group-hover/item:scale-110 transition-transform duration-200">
                {category.icon}
              </span>
              <span className={`font-medium transition-colors duration-200 ${isMilitary
                ? 'text-hud-primary group-hover/item:text-hud-glow font-hud'
                : 'text-gray-700 dark:text-gray-300 group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400'
                }`}>
                {isMilitary ? category.name.toUpperCase() : category.name}
              </span>
            </div>
          </button>
        ))}
      </div>
      <div className="p-2 border-t border-gray-200/20 dark:border-gray-700/50">
        <NavLink
          to={basePath}
          onClick={() => {
            setIsOpen(false);
            if (setMobileMenuOpen) {
              setMobileMenuOpen(false);
            }
          }}
          className="block w-full text-left px-3 py-2 text-sm font-medium transition-all duration-200 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg"
        >
          ALL
        </NavLink>
      </div>
    </div>
  );
};
