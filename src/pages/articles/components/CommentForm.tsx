import React, { useState } from 'react';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  onCancel?: () => void;
  initialValue?: string;
  placeholder?: string;
  submitButtonText?: string;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  onCancel,
  initialValue = '',
  placeholder = 'コメントを入力してください...',
  submitButtonText = '投稿'
}) => {
  const [content, setContent] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  const maxLength = 1000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('コメントを入力してください');
      return;
    }

    if (content.length > maxLength) {
      setError(`コメントは${maxLength}文字以下で入力してください`);
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await onSubmit(content.trim());
      setContent('');
    } catch (err) {
      setError('コメントの投稿に失敗しました');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setContent(initialValue);
    setError('');
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          disabled={isSubmitting}
          rows={4}
          maxLength={maxLength}
          className={`w-full px-4 py-3 rounded-lg border resize-none focus:outline-none focus:ring-2 transition-all bg-white/10 border-[#39FF14]/30 text-[color:var(--text-primary)] focus:ring-[#39FF14] focus:border-[#39FF14] placeholder-gray-400 backdrop-blur-sm ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label="コメント入力"
        />
        <div className="flex justify-between items-center mt-1 text-sm text-gray-500">
          <span className={content.length > maxLength ? 'text-red-500' : ''}>
            {content.length} / {maxLength}
          </span>
          {error && (
            <span className="text-red-500">{error}</span>
          )}
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-lg font-medium transition-all bg-white/10 text-[color:var(--text-primary)] hover:bg-white/20 border border-[#39FF14]/30 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            キャンセル
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className={`px-6 py-2 rounded-lg transition-all bg-gradient-to-r from-[#39FF14] to-green-500 text-[#0b1d3a] hover:from-green-400 hover:to-[#39FF14] font-bold ${isSubmitting || !content.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg transform hover:scale-105'}`}
        >
          {isSubmitting ? '送信中...' : submitButtonText}
        </button>
      </div>
    </form>
  );
};

