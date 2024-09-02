import Link from 'next/link';
import { Button } from '../../components/ui/button';
import { Plane, Book, MapPin, BarChart2, Users, ChevronRight } from 'lucide-react';


interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className, ...props }) => (
  <header className="bg-white text-gray-900 p-4 shadow-sm fixed w-full z-50">
    <div className="container mx-auto flex justify-between items-center">
      <Link href="/" className="text-2xl font-bold flex items-center">
        <Plane className="mr-2 text-blue-600" />
        <span className="font-sans tracking-wider">Flight Training LMS</span>
      </Link>
    </div>
  </header>
);

export default Header;