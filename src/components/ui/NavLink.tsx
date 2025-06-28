import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export const NavLink: React.FC<NavLinkProps> = ({ to, children, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to || 
                  (location.pathname === '/' && to === '/');
  
  return (
    <Link 
      to={to} 
      className={`px-3 py-2 sm:px-4 text-sm sm:text-base font-medium rounded-md transition-colors duration-200 ${
        isActive 
          ? 'bg-indigo-700 text-white' 
          : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
      }`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}; 