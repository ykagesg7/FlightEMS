import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2 } from 'lucide-react';

const CourseManagement = () => {
  const [courses, setCourses] = useState([
    { id: 1, title: 'Flight Theory', description: 'Learn the basics of flight theory', status: 'active', students: 25 },
    { id: 2, title: 'Navigation', description: 'Master navigation techniques', status: 'active', students: 18 },
    { id: 3, title: 'Safety Procedures', description: 'Essential safety procedures for pilots', status: 'draft', students: 0 },
  ]);

  const [newCourse, setNewCourse] = useState({ title: '', description: '', status: 'draft' });
  const [editingCourse, setEditingCourse] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleAddCourse = () => {
    setCourses([...courses, { ...newCourse, id: courses.length + 1, students: 0 }]);
    setNewCourse({ title: '', description: '', status: 'draft' });
    setIsAddDialogOpen(false);
  };

  const handleEditCourse = () => {
    setCourses(courses.map(course => course.id === editingCourse.id ? editingCourse : course));
    setIsEditDialogOpen(false);
  };

  const handleDeleteCourse = (id) => {
    setCourses(courses.filter(course => course.id !== id));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Course Management</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Course
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Course</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Course Description</Label>
                <Textarea
                  id="description"
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={newCourse.status}
                  onChange={(e) => setNewCourse({ ...newCourse, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                </select>
              </div>
              <Button onClick={handleAddCourse}>Add Course</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <Input
              placeholder="Search courses..."
              className="max-w-sm"
              type="search"
              icon={<Search className="h-4 w-4 text-gray-500" />}
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>{course.title}</TableCell>
                  <TableCell>{course.description}</TableCell>
                  <TableCell>
                    <Badge variant={course.status === 'active' ? 'default' : 'secondary'}>
                      {course.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{course.students}</TableCell>
                  <TableCell>
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setEditingCourse(course)} className="mr-2">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Course</DialogTitle>
                        </DialogHeader>
                        {editingCourse && (
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="edit-title">Course Title</Label>
                              <Input
                                id="edit-title"
                                value={editingCourse.title}
                                onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-description">Course Description</Label>
                              <Textarea
                                id="edit-description"
                                value={editingCourse.description}
                                onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-status">Status</Label>
                              <select
                                id="edit-status"
                                value={editingCourse.status}
                                onChange={(e) => setEditingCourse({ ...editingCourse, status: e.target.value })}
                                className="w-full border border-gray-300 rounded-md p-2"
                              >
                                <option value="draft">Draft</option>
                                <option value="active">Active</option>
                              </select>
                            </div>
                            <Button onClick={handleEditCourse}>Save Changes</Button>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteCourse(course.id)}>
                      <Trash2 className="h-4 w-4 mr-1" />
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