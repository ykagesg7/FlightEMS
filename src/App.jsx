import React from 'react';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Community from "./pages/Community";
import Course from "./pages/Course";
import AviationLaw from './pages/Course/AviationLaw'
import AviationLawBasics from './pages/Course/AviationLawBasics';
import MissionPlanningPage from './pages/Course/MissionPlanning';
import WeatherBasics1 from './pages/Course/Weather/WeatherBasics1';
import WeatherBasics2 from './pages/Course/Weather/WeatherBasics2';
import WeatherBasics3 from './pages/Course/Weather/WeatherBasics3';
import WeatherBasics4 from './pages/Course/Weather/WeatherBasics4';
import WeatherBasics5 from './pages/Course/Weather/WeatherBasics5';
import WeatherBasics6 from './pages/Course/Weather/WeatherBasics6';
import CourseManagement from "./pages/CourseManagement";
import Login from "./pages/Login";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import FlightPlannerPage from "./components/FlightPlanner/FlightPlanner";
import 'leaflet/dist/leaflet.css';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.user_metadata?.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Header />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/course" element={<Course />} />
              <Route path="/aviation-law" element={<AviationLaw />} />
              <Route path="/aviation-law/basics" element={<AviationLawBasics />} />
              <Route path="/mission-planning" element={<MissionPlanningPage />} />
              <Route path="/weather/basics/1" element={<WeatherBasics1 />} />
              <Route path="/weather/basics/2" element={<WeatherBasics2 />} />
              <Route path="/weather/basics/3" element={<WeatherBasics3 />} />
              <Route path="/weather/basics/4" element={<WeatherBasics4 />} />
              <Route path="/weather/basics/5" element={<WeatherBasics5 />} />
              <Route path="/weather/basics/6" element={<WeatherBasics6 />} />
              <Route path="/community" element={<Community />} />
              <Route path="/flight-planner" element={<FlightPlannerPage />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/course-management" element={<CourseManagement />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/login" element={<Login />} />
            </Routes>
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;