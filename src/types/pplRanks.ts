/**
 * PPL Rank System Type Definitions
 * PPL Syllabus階層構造に基づくランクシステムの型定義
 */

export interface PPLRankDefinition {
  id: string;
  rank_code: string;
  rank_name: string;
  rank_level: number; // 1: Phase, 2: Section, 3: Category, 4: Subject, 5: PPL全体
  parent_rank_code: string | null;
  subject_code: string | null;
  category_code: string | null;
  section_code: string | null;
  phase: number | null; // 1, 2, 3
  required_content_ids: string[];
  description: string | null;
  icon: string | null;
  color: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface UserPPLRank {
  id: string;
  user_id: string;
  rank_code: string;
  earned_at: string;
  // 結合データ
  rank_name?: string;
  rank_level?: number;
  subject_code?: string | null;
  category_code?: string | null;
  section_code?: string | null;
  phase?: number | null;
  icon?: string | null;
  color?: string | null;
}

export interface PPLRankWithDefinition extends UserPPLRank {
  definition: PPLRankDefinition;
}

/**
 * ランクレベル
 */
export enum PPLRankLevel {
  Phase = 1,      // Phase 1-3
  Section = 2,    // セクションマスター
  Category = 2,   // カテゴリーマスター（rank_level=2だがsection_code=NULL）
  Subject = 3,    // 科目マスター
  PPL = 4         // PPL全体マスター
}

/**
 * ランク表示用の情報
 */
export interface PPLRankDisplay {
  rank_code: string;
  rank_name: string;
  rank_level: number;
  icon: string;
  color: string;
  earned_at: string;
  description: string | null;
  progress?: {
    current: number;
    total: number;
    percentage: number;
  };
}

