import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2 } from 'lucide-react';

const FlightTips = () => {
  const { user } = useAuth();
  const [tips, setTips] = useState([]);
  const [newTip, setNewTip] = useState({ title: '', content: '' });
  const [isTeacher, setIsTeacher] = useState(false);
  const [editingTipId, setEditingTipId] = useState(null);

  useEffect(() => {
    fetchTips();
    if (user) {
      checkUserRole();
    }
  }, [user]);

  const fetchTips = async () => {
    try {
      const { data, error } = await supabase
        .from('flight_tips')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setTips(data);
    } catch (error) {
      console.error('Error fetching tips:', error.message);
    }
  };

  const checkUserRole = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('roll')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      setIsTeacher(data.roll === 'teacher');
    } catch (error) {
      console.error('Error checking user role:', error.message);
    }
  };

  const handleNewTip = async () => {
    try {
      const { data, error } = await supabase
        .from('flight_tips')
        .insert([{ ...newTip, author_id: user.id }]);
      if (error) throw error;
      fetchTips();
      setNewTip({ title: '', content: '' });
    } catch (error) {
      console.error('Error adding new tip:', error.message);
    }
  };

  const handleEditTip = async () => {
    try {
      const { error } = await supabase
        .from('flight_tips')
        .update({ title: newTip.title, content: newTip.content })
        .eq('id', editingTipId);
      if (error) throw error;
      fetchTips();
      setNewTip({ title: '', content: '' });
      setEditingTipId(null);
    } catch (error) {
      console.error('Error updating tip:', error.message);
    }
  };

  const handleDeleteTip = async (tipId) => {
    try {
      const { error } = await supabase
        .from('flight_tips')
        .delete()
        .eq('id', tipId);
      if (error) throw error;
      fetchTips();
    } catch (error) {
      console.error('Error deleting tip:', error.message);
    }
  };

  const startEditing = (tip) => {
    setNewTip({ title: tip.title, content: tip.content });
    setEditingTipId(tip.id);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Flight Tips Blog</h1>
      
      {isTeacher && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editingTipId ? 'Edit Flight Tip' : 'Share a New Flight Tip'}</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Title"
              value={newTip.title}
              onChange={(e) => setNewTip({ ...newTip, title: e.target.value })}
              className="mb-4"
            />
            <Textarea
              placeholder="Share your flight tip..."
              value={newTip.content}
              onChange={(e) => setNewTip({ ...newTip, content: e.target.value })}
              className="mb-4"
            />
            <Button onClick={editingTipId ? handleEditTip : handleNewTip}>
              {editingTipId ? 'Update Tip' : 'Share Tip'}
            </Button>
            {editingTipId && (
              <Button variant="outline" onClick={() => setEditingTipId(null)} className="ml-2">
                Cancel Edit
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <div className="space-y-8">
        {tips.map((tip) => (
          <Card key={tip.id} className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">{tip.title}</CardTitle>
                {isTeacher && (
                  <div>
                    <Button variant="ghost" size="sm" onClick={() => startEditing(tip)} className="mr-2">
                      <Pencil size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteTip(tip.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-gray-700">{tip.content}</p>
              <p className="text-sm text-gray-500">Posted on: {new Date(tip.created_at).toLocaleDateString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FlightTips;