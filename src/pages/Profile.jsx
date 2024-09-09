import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from '../lib/supabaseClient';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        console.log('Fetching profile for user:', user.id);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
        } else {
          console.log('Profile data:', data);
          setProfile(data);
        }
      } else {
        console.log('No user found, unable to fetch profile');
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!profile) {
    return <div>Profile not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={profile.avatar_url} alt={profile.username} />
              <AvatarFallback>{profile.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{profile.full_name}</h2>
              <p className="text-gray-500">@{profile.username}</p>
            </div>
          </div>
          <div className="space-y-2">
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Website:</strong> {profile.website || 'Not specified'}</p>
            <p><strong>Role:</strong> {profile.roll}</p>
            <p><strong>Member since:</strong> {new Date(profile.created_at).toLocaleDateString()}</p>
            <p><strong>Last updated:</strong> {new Date(profile.updated_at).toLocaleDateString()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;