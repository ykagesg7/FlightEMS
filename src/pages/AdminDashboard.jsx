import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw } from 'lucide-react';

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - replace with actual data from Supabase
  const studentProgress = [
    { id: 1, name: 'John Doe', progress: 75, course: 'Flight Theory' },
    { id: 2, name: 'Jane Smith', progress: 60, course: 'Navigation' },
    { id: 3, name: 'Bob Johnson', progress: 90, course: 'Safety Procedures' },
    { id: 4, name: 'Alice Brown', progress: 45, course: 'Flight Theory' },
    { id: 5, name: 'Charlie Davis', progress: 80, course: 'Navigation' },
  ];

  const courseCompletionData = [
    { name: 'Flight Theory', completed: 20, inProgress: 15 },
    { name: 'Navigation', completed: 18, inProgress: 12 },
    { name: 'Safety Procedures', completed: 25, inProgress: 10 },
    { name: 'Aircraft Systems', completed: 15, inProgress: 20 },
    { name: 'Meteorology', completed: 22, inProgress: 8 },
  ];

  const recentActivities = [
    { id: 1, user: 'John Doe', action: 'Completed Flight Theory module', timestamp: '2023-04-15 14:30' },
    { id: 2, user: 'Jane Smith', action: 'Started Navigation course', timestamp: '2023-04-15 13:45' },
    { id: 3, user: 'Bob Johnson', action: 'Submitted Safety Procedures exam', timestamp: '2023-04-15 11:20' },
  ];

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate data refresh
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={handleRefresh} disabled={isLoading}>
          {isLoading ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh Data
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Total Students</p>
                <p className="text-3xl font-bold">150</p>
              </div>
              <div>
                <p className="text-sm font-medium">Active Courses</p>
                <p className="text-3xl font-bold">5</p>
              </div>
              <div>
                <p className="text-sm font-medium">Average Completion Rate</p>
                <p className="text-3xl font-bold">72%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Course Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={courseCompletionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" stackId="a" fill="#8884d8" />
                <Bar dataKey="inProgress" stackId="a" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Student Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <Input
              placeholder="Search students..."
              className="max-w-sm"
              type="search"
              icon={<Search className="h-4 w-4 text-gray-500" />}
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentProgress.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.course}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Progress value={student.progress} className="w-full mr-4" />
                      <span className="text-sm font-medium">{student.progress}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {recentActivities.map((activity) => (
              <li key={activity.id} className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium">{activity.user}</p>
                <p className="text-sm text-gray-600">{activity.action}</p>
                <p className="text-xs text-gray-400">{activity.timestamp}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;