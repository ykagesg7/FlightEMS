import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  // Mock data - replace with actual data from Supabase
  const progressData = [
    { subject: 'Flight Theory', progress: 75 },
    { subject: 'Navigation', progress: 60 },
    { subject: 'Safety Procedures', progress: 90 },
  ];

  const activityData = [
    { name: 'Mon', hours: 2 },
    { name: 'Tue', hours: 3 },
    { name: 'Wed', hours: 1 },
    { name: 'Thu', hours: 4 },
    { name: 'Fri', hours: 3 },
    { name: 'Sat', hours: 5 },
    { name: 'Sun', hours: 2 },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Welcome back, {user?.name || 'Student'}!</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Course Progress</CardTitle>
          </CardHeader>
          <CardContent>
            {progressData.map((item, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm sm:text-base">{item.subject}</span>
                  <span className="text-sm sm:text-base">{item.progress}%</span>
                </div>
                <Progress value={item.progress} className="w-full" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] sm:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="hours" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;