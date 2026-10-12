import type { SpiralLmsNodeContentRow, SpiralLmsNodePrerequisiteRow, SpiralLmsNodeRow, SpiralLmsUserProgressRow } from './spiralLms';

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
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
