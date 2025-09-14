import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const NavLink: React.FC<NavLinkProps> = ({ to, children, onClick, className }) => {
  const location = useLocation();
  const isActive = location.pathname === to ||
    (location.pathname === '/' && to === '/');

  // classNameが指定されている場合はそれを使用、されていない場合はデフォルトスタイル
  const defaultClassName = `px-3 py-2 sm:px-4 text-sm sm:text-base font-medium rounded-md transition-colors duration-200 ${isActive
      ? 'bg-indigo-700 text-white'
      : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
    }`;

  return (
    <Link
      to={to}
      className={className || defaultClassName}
      onClick={onClick}
    >
      {children}
    </Link>
  );
};
