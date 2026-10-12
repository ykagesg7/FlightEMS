/** Spiral matrix LMS — client types (DB: scripts/database/20261012_spiral_lms_*.sql). */

export type SpiralLmsNodeStatus =
  | 'LOCKED'
  | 'AVAILABLE'
  | 'IN_PROGRESS'
  | 'MASTERED'
  | 'MAINTENANCE';

export type SpiralLmsAttemptKind = 'content_view' | 'mini_quiz';

export type SpiralLmsUnlockConfig = {
  z_level_gate?: string;
  [key: string]: unknown;
};

export type SpiralLmsNodeRow = {
  id: string;
  title: string;
  quadrant: number;
  z_level: number;
  sort_order: number;
  passing_score: number | null;
  unlock_config: SpiralLmsUnlockConfig;
  is_published: boolean;
  opens_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SpiralLmsNodePrerequisiteRow = {
  node_id: string;
  prerequisite_node_id: string;
};

export type SpiralLmsNodeContentRow = {
  node_id: string;
  content_slug: string;
  content_type: 'article' | 'lesson';
  is_required: boolean;
  sort_order: number;
};

export type SpiralLmsUserProgressRow = {
  user_id: string;
  node_id: string;
  status: SpiralLmsNodeStatus;
  attempts: number;
  last_attempt_at: string | null;
  mastered_at: string | null;
  updated_at: string;
};

export type SpiralLmsNodeContent = SpiralLmsNodeContentRow;

export type SpiralLmsNode = SpiralLmsNodeRow & {
  /** True when `opens_at` is set and still in the future (display time gate). */
  opensAtLocked: boolean;
  prerequisites: string[];
  contents: SpiralLmsNodeContent[];
};

export type SpiralLmsUserProgress = SpiralLmsUserProgressRow & {
  opensAtLocked: boolean;
  /** Client display status combining server `status` and `opens_at` unlock (PR ③). */
  effectiveStatus: SpiralLmsNodeStatus;
};

export type SpiralLmsRecordAttemptResponse = {
  success: boolean;
  idempotent: boolean;
  attempt_id: string;
  passed: boolean;
  node_id: string;
  node_status: SpiralLmsNodeStatus;
  content_slug: string | null;
};

export type SpiralLmsContentViewAttemptInput = {
  nodeId: string;
  attemptKind: 'content_view';
  contentSlug: string;
};

export type SpiralLmsMiniQuizAttemptInput = {
  nodeId: string;
  attemptKind: 'mini_quiz';
  score: number;
};

export type SpiralLmsRecordAttemptInput =
  | SpiralLmsContentViewAttemptInput
  | SpiralLmsMiniQuizAttemptInput;
