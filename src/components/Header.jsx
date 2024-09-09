import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: "/dashboard", label: "Dashboard", roles: ["student", "teacher", "admin"] },
    { to: "/course", label: "Courses", roles: ["student", "teacher", "admin"] },
    { to: "/community", label: "Community", roles: ["student", "teacher", "admin"] },
    { to: "/admin-dashboard", label: "Admin Dashboard", roles: ["admin"] },
    { to: "/course-management", label: "Course Management", roles: ["admin", "teacher"] },
  ];

  const getInitials = (name) => {
    return name && typeof name === 'string' ? name.charAt(0).toUpperCase() : '?';
  };

  const userName = user?.user_metadata?.full_name || user?.email || 'User';
  const userRole = user?.user_metadata?.role || 'student';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <NavLink to="/" className="text-2xl font-bold text-blue-600">Flight Academy</NavLink>
        <nav>
          <ul className="flex space-x-4">
            {navItems.map((item, index) => (
              (item.roles.includes(userRole) || userRole === 'admin') && (
                <li key={index}>
                  <NavLink to={item.to} className="text-gray-600 hover:text-blue-600">
                    {item.label}
                  </NavLink>
                </li>
              )
            ))}
          </ul>
        </nav>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer">
                <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${userName}`} alt={userName} />
                <AvatarFallback>{getInitials(userName)}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleProfileClick}>
                プロフィール
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                設定
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>ログアウト</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild>
            <NavLink to="/login">ログイン</NavLink>
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;