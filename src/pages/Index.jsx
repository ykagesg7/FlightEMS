import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NavLink } from 'react-router-dom';
import HeroSection from '@/components/HeroSection';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <HeroSection
        image="/f16.png"
        title="Break Through"
        subtitle="Learn to fly, Aim high, Soar the sky together."
        gradient="to-r"
      />
      
      <div className="container mx-auto px-4 py-8 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-blue-900">Flight Theory</CardTitle>
              <CardDescription>Learn the fundamentals of aerodynamics and aircraft systems</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-blue-900 hover:bg-blue-800 text-white">
                <NavLink to="/learn">Start Learning</NavLink>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-blue-900">Navigation</CardTitle>
              <CardDescription>Master flight planning and navigation techniques</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-blue-900 hover:bg-blue-800 text-white">
                <NavLink to="/learn">Explore Courses</NavLink>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-blue-900">Safety Procedures</CardTitle>
              <CardDescription>Learn critical safety protocols and emergency procedures</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-blue-900 hover:bg-blue-800 text-white">
                <NavLink to="/learn">Begin Training</NavLink>
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-12 sm:mt-16 text-center space-y-4">
          <Button asChild className="text-lg px-6 py-3 sm:px-8 sm:py-4 bg-blue-900 hover:bg-blue-800 text-white">
            <NavLink to="/login">Login to Start</NavLink>
          </Button>
          <div>
            <span className="text-gray-600">New to Flight Academy? </span>
            <Button asChild variant="link" className="text-blue-600 hover:text-blue-800">
              <NavLink to="/login?register=true">Register here</NavLink>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;