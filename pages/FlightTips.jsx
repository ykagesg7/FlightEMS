import React, { useState, useEffect, useRef, useReducer } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Paperclip, Check, Edit, Trash } from 'lucide-react';

// Reducer function for managing newTip state
const newTipReducer = (state, action) => {
  switch (action.type) {
    case 'SET_TITLE':
      return { ...state, title: action.payload };
    case 'SET_CONTENT':
      return { ...state, content: action.payload };
    case 'SET_ATTACHMENT_URL':
      return { ...state, attachmenturl: action.payload };
    case 'RESET':
      return { title: '', content: '', attachmenturl: '' };
    default:
      return state;
  }
};

const FlightTips = () => {
  const [tips, setTips] = useState([]);
  const [newTip, dispatchNewTip] = useReducer(newTipReducer, { title: '', content: '', attachmenturl: '' });
  const [editingTipId, setEditingTipId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadComplete, setIsUploadComplete] = useState(false);
  const fileInputRef = useRef(null);

  const { user } = useAuth();

  useEffect(() => {
    fetchTips();
  }, []);

  const fetchTips = async () => {
    const { data, error } = await supabase
      .from('flight_tips')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.error('Error fetching tips:', error);
    else setTips(data);
  };

  const handleNewTip = async () => {
    const { data, error } = await supabase
      .from('flight_tips')
      .insert([{ 
        title: newTip.title, 
        content: newTip.content, 
        attachmenturl: newTip.attachmenturl,
        author_id: user.id
      }]);
    if (error) console.error('Error adding new tip:', error);
    else {
      fetchTips();
      dispatchNewTip({ type: 'RESET' });
      setIsUploadComplete(false);
    }
  };

  const handleEditTip = (tipId) => {
    const tipToEdit = tips.find(tip => tip.id === tipId);
    dispatchNewTip({ type: 'SET_TITLE', payload: tipToEdit.title });
    dispatchNewTip({ type: 'SET_CONTENT', payload: tipToEdit.content });
    dispatchNewTip({ type: 'SET_ATTACHMENT_URL', payload: tipToEdit.attachmenturl });
    setEditingTipId(tipId);
  };

  const handleUpdateTip = async () => {
    const { error } = await supabase
      .from('flight_tips')
      .update({ ...newTip })
      .eq('id', editingTipId);
    if (error) console.error('Error updating tip:', error);
    else {
      fetchTips();
      dispatchNewTip({ type: 'RESET' });
      setEditingTipId(null);
    }
  };

  const handleDeleteTip = async (tipId) => {
    const { error } = await supabase
      .from('flight_tips')
      .delete()
      .eq('id', tipId);
    if (error) console.error('Error deleting tip:', error);
    else fetchTips();
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    setIsUploading(true);
    setUploadProgress(0);
    setIsUploadComplete(false);
  
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;
  
    try {
      const { error: uploadError } = await supabase.storage
        .from('tip-attachments')
        .upload(filePath, file, {
          onUploadProgress: (progress) => {
            setUploadProgress((progress.loaded / progress.total) * 100);
          },
        });
  
      if (uploadError) throw uploadError;
  
      // 公開URLを取得
      const { data: { signedUrl }, error: urlError } = await supabase.storage
        .from('tip-attachments')
        .createSignedUrl(filePath, {
          expiresIn: 31536000 // 3年 (秒)
        });
  
      if (urlError) throw urlError;
  
      console.log('Uploaded file URL:', signedUrl); // Log the URL for debugging
      dispatchNewTip({ type: 'SET_ATTACHMENT_URL', payload: signedUrl });
      setIsUploadComplete(true);
    } catch (error) {
      console.error('Error handling file upload:', error);
      // エラーメッセージをユーザーに表示する
      // 例：alert('ファイルのアップロードに失敗しました。');
    } finally {
      setIsUploading(false);
    }
  };

  const TipForm = () => {
    const triggerFileInput = () => {
      fileInputRef.current.click();
    };

    return (
      <Card className="mb-8 bg-white shadow-lg">
        <CardHeader>
          <CardTitle>新しいTipを共有</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="タイトル"
            value={newTip.title}
            onChange={(e) => dispatchNewTip({ type: 'SET_TITLE', payload: e.target.value })}
            className="mb-4"
          />
          <Textarea
            placeholder="フライトTipを共有..."
            value={newTip.content}
            onChange={(e) => dispatchNewTip({ type: 'SET_CONTENT', payload: e.target.value })}
            className="mb-4"
          />
          <div className="flex items-center mb-4">
            <input
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              ref={fileInputRef}
            />
            <Button variant="outline" size="sm" onClick={triggerFileInput} className="mr-2">
              <Paperclip className="mr-2 h-4 w-4" />
              ファイルを添付
            </Button>
            {isUploading && (
              <div className="ml-2 flex items-center">
                <Progress value={uploadProgress} className="w-24 mr-2" />
                <span className="text-sm text-gray-500">{Math.round(uploadProgress)}%</span>
              </div>
            )}
            {isUploadComplete && (
              <div className="ml-2 flex items-center text-green-500">
                <Check className="mr-1 h-4 w-4" />
                <span className="text-sm">File uploaded successfully</span>
              </div>
            )}
          </div>
          <Button onClick={handleNewTip}>Share Tip</Button>
        </CardContent>
      </Card>
    );
  };

  const TipCard = ({ tip, handleEditTip, handleDeleteTip }) => {
    const [attachmentError, setAttachmentError] = useState(false);
  
    const handleAttachmentError = () => {
      console.error('Failed to load attachment');
      setAttachmentError(true);
    };
  
    return (
      <Card className="mb-4 bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Avatar className="mr-2">
                <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${tip.author_id}`} />
                <AvatarFallback>{tip.author_id[0]}</AvatarFallback>
              </Avatar>
              <CardTitle>{tip.title}</CardTitle>
            </div>
            {user.role === 'teacher' && (
              <div>
                <Button variant="ghost" size="sm" onClick={() => handleEditTip(tip.id)} className="mr-2">
                  <Edit size={16} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteTip(tip.id)}>
                  <Trash size={16} />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-gray-700">{tip.content}</p>
          {tip.attachmenturl && !attachmentError ? (
            <a
              href={tip.attachmenturl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-blue-500 hover:text-blue-700 transition-colors duration-200"
              onError={handleAttachmentError}
            >
              <Paperclip className="mr-2 h-4 w-4" />
              View Attachment
            </a>
          ) : attachmentError ? (
            <p className="text-red-500">Attachment unavailable</p>
          ) : null}
        </CardContent>
      </Card>
    );
  };

  // ここでTipFormを呼び出します
  return (
    <div>
      <TipForm />
      {/* ... rest of the component ... */}
      {tips.map((tip) => (
        <TipCard key={tip.id} tip={tip} handleEditTip={handleEditTip} handleDeleteTip={handleDeleteTip} />
      ))}
    </div>
  );

};

export default FlightTips;