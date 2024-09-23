import React, { useState, useEffect, useCallback } from 'react';
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
import { Menu, X } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profile, setProfile] = useState(null);

  const fetchProfile = useCallback(async () => {
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const navItems = [
    { to: "/dashboard", label: "Dashboard", roles: ["student", "teacher", "admin"] },
    { to: "/course", label: "Courses", roles: ["student", "teacher", "admin"] },
    { to: "/community", label: "Community", roles: ["student", "teacher", "admin"] },
    //{ to: "/flight-tips", label: "Flight Tips", roles: ["student", "teacher", "admin"] },
    { to: "/flight-planner", label: "Flight Planner", roles: ["student", "teacher", "admin"] },
    { to: "/admin-dashboard", label: "Admin Dashboard", roles: ["admin"] },
    { to: "/course-management", label: "Course Management", roles: ["admin", "teacher"] },
  ];

  const getInitials = (name) => {
    return name && typeof name === 'string' ? name.charAt(0).toUpperCase() : '?';
  };

  const userName = user?.user_metadata?.full_name || user?.email || 'User';
  const userRole = user?.user_metadata?.role || 'student';

  const handleLogout = async () => {
    if (logout) {
      try {
        await logout();
        navigate('/login');
      } catch (error) {
        console.error('Logout error:', error);
      }
    } else {
      console.error('Logout function is not available');
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <NavLink to="/" className="text-2xl font-bold text-blue-600">Flight Academy</NavLink>
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
          <nav className={`md:flex ${isMenuOpen ? 'block' : 'hidden'} absolute md:relative top-16 md:top-0 left-0 right-0 bg-white md:bg-transparent z-50`}>
            <ul className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 p-4 md:p-0">
              {navItems.map((item, index) => (
                (item.roles.includes(userRole) || userRole === 'admin') && (
                  <li key={index}>
                    <NavLink to={item.to} className="text-gray-600 hover:text-blue-600 block md:inline" onClick={() => setIsMenuOpen(false)}>
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
                  {profile && profile.avatar_url ? (
                    <AvatarImage src={profile.avatar_url} alt={userName} />
                  ) : (
                    <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${userName}`} alt={userName} />
                  )}
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
      </div>
    </header>
  );
};

export default Header;