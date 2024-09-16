import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const CourseManagement = () => {
  const [courses, setCourses] = useState([
    { id: 1, title: 'Flight Theory', description: 'Learn the basics of flight theory' },
    { id: 2, title: 'Navigation', description: 'Master navigation techniques' },
    { id: 3, title: 'Safety Procedures', description: 'Essential safety procedures for pilots' },
  ]);

  const [newCourse, setNewCourse] = useState({ title: '', description: '' });

  const handleAddCourse = () => {
    setCourses([...courses, { ...newCourse, id: courses.length + 1 }]);
    setNewCourse({ title: '', description: '' });
  };

  const handleEditCourse = (id) => {
    // Implement edit functionality
    console.log('Edit course', id);
  };

  const handleDeleteCourse = (id) => {
    setCourses(courses.filter(course => course.id !== id));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Course Management</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add New Course</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Course Title"
            value={newCourse.title}
            onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
            className="mb-4"
          />
          <Textarea
            placeholder="Course Description"
            value={newCourse.description}
            onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
            className="mb-4"
          />
          <Button onClick={handleAddCourse}>Add Course</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>{course.title}</TableCell>
                  <TableCell>{course.description}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => handleEditCourse(course.id)} className="mr-2">
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteCourse(course.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseManagement;