// components/ui/avatar.tsx
import React from 'react';

interface AvatarProps {
  className?: string;
  children?: React.ReactNode;
}

interface AvatarImageProps {
  src: string;
  alt: string;
}

interface AvatarFallbackProps {
  children: React.ReactNode;
}

const Avatar: React.FC<AvatarProps> = ({ className, children }) => {
  return (
    <div className={`h-8 w-8 rounded-full ${className}`}>
      {children}
    </div>
  );
};

const AvatarImage: React.FC<AvatarImageProps> = ({ src, alt }) => {
  return <img src={src} alt={alt} className="h-8 w-8 rounded-full" />;
};

const AvatarFallback: React.FC<AvatarFallbackProps> = ({ children }) => {
  return (
    <div className="h-8 w-8 rounded-full flex justify-center items-center">
      {children}
    </div>
  );
};

export { Avatar, AvatarImage, AvatarFallback };