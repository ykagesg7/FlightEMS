import React, { useRef, useState } from 'react';
import { Calendar, Loader2, PlusCircle } from 'lucide-react';
import { useGallery } from '../../hooks/useGallery';

export const AdminEventPanel: React.FC = () => {
  const { isAdmin, createEvent, activeEvent } = useGallery();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const startsAtInputRef = useRef<HTMLInputElement>(null);
  const endsAtInputRef = useRef<HTMLInputElement>(null);

  if (!isAdmin) return null;

  const handleCalendarClick = (inputRef: React.RefObject<HTMLInputElement>) => {
    inputRef.current?.showPicker?.();
    inputRef.current?.focus();
  };

  const handleSubmit = async () => {
    setError(null);
    setMessage(null);
    if (!title || !slug) {
      setError('タイトルとスラッグは必須です');
      return;
    }
    try {
      setIsSubmitting(true);
      await createEvent({
        title,
        slug,
        description: description || null,
        status: 'active',
        starts_at: startsAt || null,
        ends_at: endsAt || null,
        created_at: '' as any, // will be ignored
        id: '' as any,
      });
      setMessage('イベントを作成しアクティブ化しました（前イベントは自動でアーカイブされます）');
      setTitle('');
      setSlug('');
      setDescription('');
      setStartsAt('');
      setEndsAt('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'イベント作成に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-event-panel mb-8 space-y-4 rounded-lg border border-white/10 bg-whiskyPapa-black-light p-4">
      <div className="flex items-center gap-2 text-white">
        <PlusCircle className="w-5 h-5 text-whiskyPapa-yellow" />
        <h3 className="text-lg font-bold">イベント作成・アクティブ化</h3>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm text-gray-300">タイトル</label>
          <input
            className="w-full rounded-md bg-black/50 border border-white/10 px-3 py-2 text-white"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例: 航空祭 2026 春"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-gray-300">スラッグ（URL用、一意）</label>
          <input
            className="w-full rounded-md bg-black/50 border border-white/10 px-3 py-2 text-white"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="例: airshow-2026-spring"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm text-gray-300">説明</label>
        <textarea
          className="w-full rounded-md bg-black/50 border border-white/10 px-3 py-2 text-white"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="イベント概要を入力"
        />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm text-gray-300">開始日時 (任意)</label>
          <div className="relative">
            <input
              ref={startsAtInputRef}
              type="datetime-local"
              className="w-full rounded-md bg-black/50 border border-white/10 px-3 py-2 pr-10 text-white"
              style={{
                colorScheme: 'dark',
              }}
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
            />
            <button
              type="button"
              onClick={() => handleCalendarClick(startsAtInputRef)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-whiskyPapa-yellow hover:text-whiskyPapa-yellow-light transition-colors"
              aria-label="カレンダーを開く"
            >
              <Calendar className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-gray-300">投票締切 (任意、これを過ぎると投票不可)</label>
          <div className="relative">
            <input
              ref={endsAtInputRef}
              type="datetime-local"
              className="w-full rounded-md bg-black/50 border border-white/10 px-3 py-2 pr-10 text-white"
              style={{
                colorScheme: 'dark',
              }}
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
            />
            <button
              type="button"
              onClick={() => handleCalendarClick(endsAtInputRef)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-whiskyPapa-yellow hover:text-whiskyPapa-yellow-light transition-colors"
              aria-label="カレンダーを開く"
            >
              <Calendar className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-md bg-whiskyPapa-yellow text-black font-bold px-4 py-2 hover:bg-whiskyPapa-yellow-light disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
          作成してアクティブ化
        </button>
        {activeEvent && (
          <span className="text-sm text-gray-300">
            現在のアクティブイベント: <span className="text-whiskyPapa-yellow">{activeEvent.title}</span>
          </span>
        )}
      </div>
      {message && <div className="text-sm text-green-400">{message}</div>}
      {error && <div className="text-sm text-red-400">{error}</div>}
    </div>
  );
};

export default AdminEventPanel;

