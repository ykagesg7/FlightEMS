import React, { useEffect, useState } from 'react';
import { Database } from '../../../types/database.types';
import { Button } from '../../../components/ui';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import { Typography } from '../../../components/ui/Typography';

type SocialLinks = {
  twitter?: string;
  instagram?: string;
  youtube?: string;
  facebook?: string;
  linkedin?: string;
};

interface SocialLinksFormProps {
  currentSocialLinks?: Database['public']['Tables']['profiles']['Row']['social_links'] | null;
  onSave?: (socialLinks: SocialLinks) => Promise<void>;
  onError?: (error: string) => void;
}

export const SocialLinksForm: React.FC<SocialLinksFormProps> = ({
  currentSocialLinks,
  onSave,
  onError,
}) => {
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(() => {
    if (currentSocialLinks && typeof currentSocialLinks === 'object') {
      return (currentSocialLinks as SocialLinks) || {};
    }
    return {};
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof SocialLinks, string>>>({});

  useEffect(() => {
    if (currentSocialLinks && typeof currentSocialLinks === 'object') {
      setSocialLinks((currentSocialLinks as SocialLinks) || {});
    }
  }, [currentSocialLinks]);

  // URLバリデーション
  const validateUrl = (url: string, platform: keyof SocialLinks): string | null => {
    if (!url.trim()) return null; // 空の場合はOK

    // 基本的なURL形式チェック
    const urlPattern = /^https?:\/\/.+/i;
    if (!urlPattern.test(url)) {
      return 'http:// または https:// で始まるURLを入力してください';
    }

    // プラットフォーム別のドメインチェック
    const domainPatterns: Record<keyof SocialLinks, RegExp> = {
      twitter: /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)/i,
      instagram: /^(https?:\/\/)?(www\.)?instagram\.com/i,
      youtube: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)/i,
      facebook: /^(https?:\/\/)?(www\.)?facebook\.com/i,
      linkedin: /^(https?:\/\/)?(www\.)?linkedin\.com/i,
    };

    const pattern = domainPatterns[platform];
    if (pattern && !pattern.test(url)) {
      return `${platform}の正しいURLを入力してください`;
    }

    return null;
  };

  const handleChange = (platform: keyof SocialLinks, value: string) => {
    setSocialLinks((prev) => ({
      ...prev,
      [platform]: value,
    }));

    // エラーをクリア
    if (errors[platform]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[platform];
        return newErrors;
      });
    }
  };

  const handleBlur = (platform: keyof SocialLinks) => {
    const url = socialLinks[platform] || '';
    const error = validateUrl(url, platform);
    if (error) {
      setErrors((prev) => ({
        ...prev,
        [platform]: error,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 全フィールドのバリデーション
    const newErrors: Partial<Record<keyof SocialLinks, string>> = {};
    Object.keys(socialLinks).forEach((key) => {
      const platform = key as keyof SocialLinks;
      const url = socialLinks[platform] || '';
      const error = validateUrl(url, platform);
      if (error) {
        newErrors[platform] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    try {
      await onSave?.(socialLinks);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '保存に失敗しました';
      onError?.(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const socialPlatforms: Array<{ key: keyof SocialLinks; label: string; icon: string; placeholder: string }> = [
    {
      key: 'twitter',
      label: 'Twitter / X',
      icon: '𝕏',
      placeholder: 'https://twitter.com/username または https://x.com/username',
    },
    {
      key: 'instagram',
      label: 'Instagram',
      icon: '📷',
      placeholder: 'https://instagram.com/username',
    },
    {
      key: 'youtube',
      label: 'YouTube',
      icon: '▶️',
      placeholder: 'https://youtube.com/@channel または https://youtube.com/channel/...',
    },
    {
      key: 'facebook',
      label: 'Facebook',
      icon: '👥',
      placeholder: 'https://facebook.com/username',
    },
    {
      key: 'linkedin',
      label: 'LinkedIn',
      icon: '💼',
      placeholder: 'https://linkedin.com/in/username',
    },
  ];

  return (
    <Card variant="brand" padding="lg">
      <CardHeader>
        <Typography variant="h3" color="brand" className="text-xl font-bold mb-2">
          ソーシャルリンク
        </Typography>
        <Typography variant="body-sm" color="muted">
          あなたのソーシャルメディアアカウントのリンクを追加できます
        </Typography>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {socialPlatforms.map((platform) => (
            <div key={platform.key}>
              <label className="block mb-2">
                <Typography variant="body-sm" className="font-medium">
                  <span className="mr-2">{platform.icon}</span>
                  {platform.label}
                </Typography>
              </label>
              <input
                type="url"
                value={socialLinks[platform.key] || ''}
                onChange={(e) => handleChange(platform.key, e.target.value)}
                onBlur={() => handleBlur(platform.key)}
                placeholder={platform.placeholder}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 ${errors[platform.key]
                  ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                  : 'border-brand-primary/30 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20'
                  } bg-brand-secondary-light text-white placeholder-gray-400 focus:outline-none`}
              />
              {errors[platform.key] && (
                <Typography variant="caption" className="text-red-500 mt-1 block">
                  {errors[platform.key]}
                </Typography>
              )}
            </div>
          ))}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="submit" variant="brand" disabled={isSaving}>
              {isSaving ? '保存中...' : '保存'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
