// components/layout/header.tsx

import Link from 'next/link';
import { Button } from '../../components/ui/button';
import { Plane } from 'lucide-react';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => (
  <header className={`bg-white text-gray-900 p-4 shadow-sm w-full z-50 ${className}`}>
    <div className="container mx-auto flex justify-between items-center">
      <Link href="/" className="text-2xl font-bold flex items-center">
        <Plane className="mr-2 text-blue-600" />
        <span className="font-sans tracking-wider">Flight Training LMS</span>
      </Link>
      <nav className="hidden md:flex space-x-6">
        <Link href="/" className="hover:text-blue-600 transition-colors text-sm font-medium">ホーム</Link>
        <Link href="/lms" className="hover:text-blue-600 transition-colors text-sm font-medium">LMS</Link>
        <Link href="/planner" className="hover:text-blue-600 transition-colors text-sm font-medium">飛行計画</Link>
      </nav>
      <Link href="/login">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full shadow-md transition-all duration-300 ease-in-out">
          ログイン
        </Button>
      </Link>
    </div>
  </header>
);

export default Header;