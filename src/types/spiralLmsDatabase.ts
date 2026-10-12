import type { SpiralLmsNodeContentRow, SpiralLmsNodePrerequisiteRow, SpiralLmsNodeRow, SpiralLmsUserProgressRow } from './spiralLms';
import type { SpiralMiniQuizQuestionRow, SpiralMiniQuizSubmitResponse } from './spiralLmsMiniQuiz';

/**
 * Minimal Supabase schema slice for spiral LMS until `database.types` is regenerated post–prod apply.
 */
export type SpiralLmsDatabase = {
  __InternalSupabase: {
    PostgrestVersion: '12.2.3 (519615d)';
  };
  public: {
    Tables: {
      nodes: {
        Row: SpiralLmsNodeRow;
        Insert: never;
        Update: never;
        Relationships: [];
      };
      node_prerequisites: {
        Row: SpiralLmsNodePrerequisiteRow;
        Insert: never;
        Update: never;
        Relationships: [];
      };
      node_contents: {
        Row: SpiralLmsNodeContentRow;
        Insert: never;
        Update: never;
        Relationships: [];
      };
      user_progress: {
        Row: SpiralLmsUserProgressRow;
        Insert: never;
        Update: never;
        Relationships: [];
      };
      node_mini_quiz_questions: {
        Row: SpiralMiniQuizQuestionRow;
        Insert: never;
        Update: never;
        Relationships: [];
      };
      spiral_content_slug_map: {
        Row: {
          content_slug: string;
          learning_content_id: string;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      record_attempt: {
        Args: {
          p_node_id: string;
          p_attempt_kind: string;
          p_client_attempt_id: string;
          p_content_slug: string | null;
          p_score: number | null;
        };
        Returns: import('./spiralLms').SpiralLmsRecordAttemptResponse;
      };
      get_node_mini_quiz_questions: {
        Args: {
          p_node_id: string;
        };
        Returns: SpiralMiniQuizQuestionRow[];
      };
      submit_mini_quiz: {
        Args: {
          p_node_id: string;
          p_client_attempt_id: string;
          p_answers: import('./spiralLmsMiniQuiz').SpiralMiniQuizAnswerPayload[];
        };
        Returns: SpiralMiniQuizSubmitResponse;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
