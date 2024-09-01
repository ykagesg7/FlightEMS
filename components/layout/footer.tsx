import { ChevronRight } from 'lucide-react';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className, ...props }) => (
  // ...
  <footer className="bg-gray-50 py-6 px-4 text-center">
    <p className="text-gray-600">
      © 2024 Flight Training LMS. All rights reserved.
    </p>
  </footer>
);

export default Footer;