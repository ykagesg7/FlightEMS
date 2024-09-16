import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

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
          setAvatarPreview(data.avatar_url);
        }
      }
    };

    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return null;

    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`; // ファイル名にタイムスタンプを追加
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, avatarFile);

    if (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }

    const { publicUrl, error: urlError } = supabase.storage
      .from('avatars')
      .getPublicUrl(data.path);

    if (urlError) {
      console.error('Error getting public URL:', urlError);
      return null;
    }

    return publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let avatarUrl = profile.avatar_url;

    if (avatarFile) {
      const uploadedUrl = await uploadAvatar();
      if (uploadedUrl) {
        avatarUrl = uploadedUrl;
      }
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        username: profile.username,
        full_name: profile.full_name,
        email: profile.email,
        website: profile.website,
        avatar_url: avatarUrl,
        updated_at: new Date(),
      })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating profile:', error);
    } else {
      alert('Profile updated successfully!');
      setProfile(prev => ({ ...prev, avatar_url: avatarUrl }));
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
            <div className="flex flex-col items-center mb-4">
              <Avatar className="w-24 h-24 mb-2">
                <AvatarImage src={avatarPreview || profile.avatar_url} alt="Avatar" />
                <AvatarFallback>{profile.username?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current.click()}
              >
                Change Avatar
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" value={profile.username || ''} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input id="full_name" name="full_name" value={profile.full_name || ''} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={profile.email || ''} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input id="website" name="website" value={profile.website || ''} onChange={handleChange} />
            </div>
            <Button type="submit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;