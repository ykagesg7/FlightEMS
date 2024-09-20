import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NavLink } from 'react-router-dom';
import HeroSection from '@/components/HeroSection';
import { ArrowRight, Bell } from 'lucide-react';

const Index = () => {
  // Mock data for announcements - replace with actual data from your backend
  const announcements = [
    { id: 1, title: "Communityの投稿機能を実装しました。", date: "2024-09-19" },
    { id: 2, title: "Flight Tipsページを開発中です。ブログの閲覧やコメントができるようにしています。", date: "2024-09-19" },
    { id: 3, title: "Flight Planning機能を開発中です。", date: "2024-09-19" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white">
      <HeroSection
        image="/f16.png"
        title="Break Through"
        gradient="to-r"
      />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">Welcome to Flight Academy</h2>
          <p className="text-xl text-blue-200">
          Learn to fly, Aim high, Soar the sky, together.
          </p>
        </div>

        <Card className="bg-white/10 backdrop-blur-lg border-none shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center text-blue-300">
              <Bell className="mr-2" /> Latest Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {announcements.map((announcement) => (
                <li key={announcement.id} className="border-b border-blue-400/30 pb-4 last:border-b-0">
                  <p className="font-semibold">{announcement.title}</p>
                  <p className="text-sm text-blue-200">{announcement.date}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        <div className="mt-16 text-center space-y-6">
          <Button asChild className="text-lg px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white transition-all duration-300 transform hover:scale-105">
            <NavLink to="/login" className="flex items-center">
              Start Your Journey <ArrowRight className="ml-2" />
            </NavLink>
          </Button>
          <div>
          <span className="text-blue-200">Already a member? </span>
            <Button asChild variant="link" className="text-white hover:text-blue-300">
              <NavLink to="/login">Log in here</NavLink>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;