/**
 * Engagement Types
 * Whisky Papa Phase 3: Shop & Gallery用の型定義
 */

import type { UserRank } from './gamification';

// ==================== Shop (Products) ====================

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  required_rank: UserRank;
  external_link: string | null;
  is_available: boolean;
  stock_count: number | null;
  created_at: string;
  updated_at: string;
}

export interface ProductInsert {
  name: string;
  description?: string | null;
  price: number;
  image_url?: string | null;
  required_rank?: UserRank;
  external_link?: string | null;
  is_available?: boolean;
  stock_count?: number | null;
}

export interface ProductUpdate {
  name?: string;
  description?: string | null;
  price?: number;
  image_url?: string | null;
  required_rank?: UserRank;
  external_link?: string | null;
  is_available?: boolean;
  stock_count?: number | null;
}

// ==================== Gallery (Fan Photos) ====================

export interface FanPhoto {
  id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  is_approved: boolean;
  is_featured: boolean;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FanPhotoInsert {
  user_id: string;
  image_url: string;
  caption?: string | null;
}

export interface FanPhotoUpdate {
  caption?: string | null;
  is_approved?: boolean;
  is_featured?: boolean;
  approved_by?: string | null;
  approved_at?: string | null;
}

export interface PhotoUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

// ==================== Blog ====================

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  author: 'narrator' | 'pilot' | 'staff';
  excerpt: string | null;
  content: string; // MDX content
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogPostMetadata {
  slug: string;
  title: string;
  author: 'narrator' | 'pilot' | 'staff';
  excerpt: string | null;
  published_at: string | null;
  created_at: string;
}

// ==================== Admin ====================

export interface GalleryReviewItem extends FanPhoto {
  user?: {
    id: string;
    username: string | null;
    avatar_url: string | null;
  };
}

