'use client';

import React, { useState } from 'react';

interface DropdownMenuProps {
  children: React.ReactElement<DropdownMenuTriggerProps>[];
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
}

interface DropdownMenuContentProps {
  children: React.ReactNode;
  align?: string;
  forceMount?: boolean;
}

interface DropdownMenuTriggerProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { isOpen, setIsOpen});
        }
        return child;
      })}
    </div>
  );
};

const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({ children, align, forceMount}) => {
  return (
    <div className={`absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 ${align === 'end' ? 'origin-top-right right-0' : 'origin-top-left left-0'}`}>
      <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
        {children}
      </div>
    </div>
  );
};

const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({ children, onClick }) => {
  return (
    <a
      href="#"
      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
      role="menuitem"
      onClick={(e) => {
        e.preventDefault();
        onClick && onClick();
      }}
    >
      {children}
    </a>
  );
};

const DropdownMenuTrigger: React.FC<{ children: React.ReactNode; isOpen?: boolean; setIsOpen?: (isOpen: boolean) => void }> = ({ children, isOpen, setIsOpen }) => {
  return (
    <div className="dropdown-menu-trigger" onClick={() => setIsOpen && setIsOpen(!isOpen)}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setIsOpen && setIsOpen(false)}></div>
      )}
    </div>
  );
};

export { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger };