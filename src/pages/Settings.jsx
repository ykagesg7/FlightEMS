import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from '../lib/supabaseClient';

const Settings = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    username: '',
    full_name: '',
    email: '',
    website: '',
    avatar_url: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
        } else {
          setProfile(data);
        }
      }
    };

    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('profiles')
      .update({
        username: profile.username,
        full_name: profile.full_name,
        email: profile.email,
        website: profile.website,
        avatar_url: profile.avatar_url,
        updated_at: new Date(),
      })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating profile:', error);
    } else {
      alert('Profile updated successfully!');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" value={profile.username} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input id="full_name" name="full_name" value={profile.full_name} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={profile.email} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input id="website" name="website" value={profile.website} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="avatar_url">Avatar URL</Label>
              <Input id="avatar_url" name="avatar_url" value={profile.avatar_url} onChange={handleChange} />
            </div>
            <Button type="submit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;