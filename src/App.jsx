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
import WeatherBasics1 from './pages/Course/Weather/WeatherBasics/WeatherBasics1';
import WeatherBasics2 from './pages/Course/Weather/WeatherBasics/WeatherBasics2';
import WeatherBasics3 from './pages/Course/Weather/WeatherBasics/WeatherBasics3';
import WeatherBasics4 from './pages/Course/Weather/WeatherBasics/WeatherBasics4';
import WeatherBasics5 from './pages/Course/Weather/WeatherBasics/WeatherBasics5';
import WeatherBasics6 from './pages/Course/Weather/WeatherBasics/WeatherBasics6';
import WeatherBasics7 from './pages/Course/Weather/WeatherBasics/WeatherBasics7';
import WeatherBasics8 from './pages/Course/Weather/WeatherBasics/WeatherBasics8';
import WeatherElements1 from './pages/Course/Weather/WeatherElements/WeatherElements1';
import WeatherElements2 from './pages/Course/Weather/WeatherElements/WeatherElements2';
import WeatherElements3 from './pages/Course/Weather/WeatherElements/WeatherElements3';
import WeatherElements4 from './pages/Course/Weather/WeatherElements/WeatherElements4';
import WeatherElements5 from './pages/Course/Weather/WeatherElements/WeatherElements5';
import WeatherElements6 from './pages/Course/Weather/WeatherElements/WeatherElements6';
import WeatherElements7 from './pages/Course/Weather/WeatherElements/WeatherElements7';
import WeatherElements8 from './pages/Course/Weather/WeatherElements/WeatherElements8';
import WeatherElements9 from './pages/Course/Weather/WeatherElements/WeatherElements9';
import WeatherElements10 from './pages/Course/Weather/WeatherElements/WeatherElements10';
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
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/course"
                element={
                  <ProtectedRoute>
                    <Course />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/aviation-law"
                element={
                  <ProtectedRoute>
                    <AviationLaw />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/aviation-law/basics"
                element={
                  <ProtectedRoute>
                    <AviationLawBasics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mission-planning"
                element={
                  <ProtectedRoute>
                    <MissionPlanningPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/weather/basics/1"
                element={
                  <ProtectedRoute>
                    <WeatherBasics1 />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/weather/basics/2"
                element={
                  <ProtectedRoute>
                    <WeatherBasics2 />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/weather/basics/3"
                element={
                  <ProtectedRoute>
                    <WeatherBasics3 />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/weather/basics/4"
                element={
                  <ProtectedRoute>
                    <WeatherBasics4 />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/weather/basics/5"
                element={
                  <ProtectedRoute>
                    <WeatherBasics5 />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/weather/basics/6"
                element={
                  <ProtectedRoute>
                    <WeatherBasics6 />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/weather/basics/7"
                element={
                  <ProtectedRoute>
                    <WeatherBasics7 />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/weather/basics/8"
                element={
                  <ProtectedRoute>
                    <WeatherBasics8 />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/weather/elements/1"
                element={
                  <ProtectedRoute>
                    <WeatherElements1 />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/weather/elements/2"
                element={
                  <ProtectedRoute>
                    <WeatherElements2 />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/weather/elements/3"
                element={
                  <ProtectedRoute>
                    <WeatherElements3 />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/weather/elements/4"
                element={
                  <ProtectedRoute>
                    <WeatherElements4 />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/weather/elements/5"
                element={
                  <ProtectedRoute>
                    <WeatherElements5 />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/weather/elements/6"
                element={
                  <ProtectedRoute>
                    <WeatherElements6 />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/weather/elements/7"
                element={
                  <ProtectedRoute>
                    <WeatherElements7 />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/weather/elements/8"
                element={
                  <ProtectedRoute>
                    <WeatherElements8 />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/weather/elements/9"
                element={
                  <ProtectedRoute>
                    <WeatherElements9 />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/weather/elements/10"
                element={
                  <ProtectedRoute>
                    <WeatherElements10 />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/community"
                element={
                  <ProtectedRoute>
                    <Community />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/flight-planner"
                element={
                  <ProtectedRoute>
                    <FlightPlannerPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute allowedRoles={["Teacher"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/course-management"
                element={
                  <ProtectedRoute allowedRoles={["Teacher"]}>
                    <CourseManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
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