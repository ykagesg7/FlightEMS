import { HomeIcon, BookOpenIcon, UsersIcon, LayoutDashboardIcon } from "lucide-react";
import Index from "./pages/Index.jsx";

export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Dashboard",
    to: "/dashboard",
    icon: <LayoutDashboardIcon className="h-4 w-4" />,
    page: null, // Handled in App.jsx
  },
  {
    title: "Courses",
    to: "/course",
    icon: <BookOpenIcon className="h-4 w-4" />,
    page: null, // Handled in App.jsx
  },
  {
    title: "Community",
    to: "/community",
    icon: <UsersIcon className="h-4 w-4" />,
    page: null, // Handled in App.jsx
  },
];