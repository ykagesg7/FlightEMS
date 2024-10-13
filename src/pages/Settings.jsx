import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const fileInputRef = useRef(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('プロフィールの取得中にエラーが発生しました:', error);
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

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const avatarUrl = await uploadAvatar(file);
      if (avatarUrl) {
        setProfile(prev => ({ ...prev, avatar_url: avatarUrl }));
        await updateProfile({ avatar_url: avatarUrl });
      }
    }
  };

  const uploadAvatar = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file);
  
    if (uploadError) {
      console.error('アバターのアップロード中にエラーが発生しました:', uploadError);
      setMessage({ type: 'error', content: 'アバターのアップロードに失敗しました。もう一度お試しください。' });
      return null;
    }

    const { data: { publicUrl }, error: urlError } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    if (urlError) {
      console.error('公開URLの取得中にエラーが発生しました:', urlError);
      return null;
    }

    return publicUrl;
  };

  const updateProfile = async (updates) => {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      console.error('プロフィールの更新中にエラーが発生しました:', error);
      setMessage({ type: 'error', content: 'プロフィールの更新に失敗しました。もう一度お試しください。' });
    } else {
      setMessage({ type: 'success', content: 'プロフィールが正常に更新されました！' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', content: '' });

    await updateProfile({
      username: profile.username,
      full_name: profile.full_name,
      email: profile.email,
      website: profile.website,
      updated_at: new Date(),
    });

    setLoading(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', content: '新しいパスワードと確認用パスワードが一致しません。' });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      console.error('パスワード変更中にエラーが発生しました:', error);
      setMessage({ type: 'error', content: 'パスワードの変更に失敗しました。もう一度お試しください。' });
    } else {
      setMessage({ type: 'success', content: 'パスワードが正常に変更されました！' });
      setNewPassword('');
      setConfirmPassword('');
    }
    setLoading(false);
  };

  const handleAccountDeletion = async () => {
    if (window.confirm('本当にアカウントを削除しますか？この操作は取り消せません。')) {
      setLoading(true);
      const { error } = await supabase.auth.admin.deleteUser(user.id);

      if (error) {
        console.error('アカウント削除中にエラーが発生しました:', error);
        setMessage({ type: 'error', content: 'アカウントの削除に失敗しました。もう一度お試しください。' });
      } else {
        // ログアウト処理とリダイレクトをここに追加
        setMessage({ type: 'success', content: 'アカウントが正常に削除されました。' });
      }
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">アカウント設定</CardTitle>
          <CardDescription>アカウント情報と設定を管理します</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">プロフィール</TabsTrigger>
              <TabsTrigger value="account">アカウント</TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col items-center">
                  <Avatar className="w-32 h-32 mb-4">
                    <AvatarImage src={profile.avatar_url} alt="アバター" />
                    <AvatarFallback>{profile.username?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current.click()}
                    className="flex items-center"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    アバターを変更
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username">ユーザー名</Label>
                    <Input
                      id="username"
                      name="username"
                      value={profile.username || ''}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="full_name">フルネーム</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      value={profile.full_name || ''}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">メールアドレス</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profile.email || ''}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">ウェブサイト</Label>
                    <Input
                      id="website"
                      name="website"
                      value={profile.website || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      変更を保存中
                    </>
                  ) : (
                    '変更を保存'
                  )}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="account">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">パスワード変更</h3>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <Label htmlFor="new-password">新しいパスワード</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirm-password">パスワードの確認</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'パスワードを変更中...' : 'パスワードを変更'}
                    </Button>
                  </form>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">アカウント削除</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    アカウントを削除すると、すべてのデータが永久に失われます。この操作は取り消せません。
                  </p>
                  <Button variant="destructive" onClick={handleAccountDeletion} disabled={loading}>
                    {loading ? 'アカウントを削除中...' : 'アカウントを削除'}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          {message.content && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className="mt-4">
              <AlertDescription>{message.content}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;