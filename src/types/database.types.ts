export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          date: string
          id: number
          title: string
        }
        Insert: {
          date: string
          id?: number
          title: string
        }
        Update: {
          date?: string
          id?: number
          title?: string
        }
        Relationships: []
      }
      learning_content_comments: {
        Row: {
          content: string
          content_id: string
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          content_id: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          content_id?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_content_comments_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "learning_content_stats"
            referencedColumns: ["content_id"]
          },
          {
            foreignKeyName: "learning_content_comments_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "learning_contents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_content_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_content_likes: {
        Row: {
          content_id: string
          created_at: string | null
          id: string
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          content_id: string
          created_at?: string | null
          id?: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          content_id?: string
          created_at?: string | null
          id?: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_content_likes_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "learning_content_stats"
            referencedColumns: ["content_id"]
          },
          {
            foreignKeyName: "learning_content_likes_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "learning_contents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_content_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_content_views: {
        Row: {
          content_id: string
          created_at: string | null
          id: string
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          content_id: string
          created_at?: string | null
          id?: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          content_id?: string
          created_at?: string | null
          id?: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_content_views_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "learning_content_stats"
            referencedColumns: ["content_id"]
          },
          {
            foreignKeyName: "learning_content_views_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "learning_contents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_content_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_contents: {
        Row: {
          category: string
          content_type: string
          created_at: string
          description: string | null
          id: string
          is_freemium: boolean | null
          is_published: boolean | null
          order_index: number
          parent_id: string | null
          sub_category: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          content_type?: string
          created_at?: string
          description?: string | null
          id: string
          is_freemium?: boolean | null
          is_published?: boolean | null
          order_index?: number
          parent_id?: string | null
          sub_category?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_freemium?: boolean | null
          is_published?: boolean | null
          order_index?: number
          parent_id?: string | null
          sub_category?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_contents_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "learning_content_stats"
            referencedColumns: ["content_id"]
          },
          {
            foreignKeyName: "learning_contents_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "learning_contents"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_progress: {
        Row: {
          completed: boolean
          content_id: string
          created_at: string
          id: string
          last_position: number
          last_read_at: string
          progress_percentage: number
          read_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          content_id: string
          created_at?: string
          id?: string
          last_position?: number
          last_read_at?: string
          progress_percentage?: number
          read_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          content_id?: string
          created_at?: string
          id?: string
          last_position?: number
          last_read_at?: string
          progress_percentage?: number
          read_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_progress_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "learning_content_stats"
            referencedColumns: ["content_id"]
          },
          {
            foreignKeyName: "learning_progress_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "learning_contents"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_sessions: {
        Row: {
          completion_rate: number | null
          comprehension_score: number | null
          content_id: string
          content_type: string | null
          created_at: string | null
          duration_minutes: number | null
          ended_at: string | null
          engagement_score: number | null
          id: string
          session_duration: number | null
          session_metadata: Json | null
          session_type: string
          status: string | null
          user_id: string
        }
        Insert: {
          completion_rate?: number | null
          comprehension_score?: number | null
          content_id: string
          content_type?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          engagement_score?: number | null
          id?: string
          session_duration?: number | null
          session_metadata?: Json | null
          session_type: string
          status?: string | null
          user_id: string
        }
        Update: {
          completion_rate?: number | null
          comprehension_score?: number | null
          content_id?: string
          content_type?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          engagement_score?: number | null
          id?: string
          session_duration?: number | null
          session_metadata?: Json | null
          session_type?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      learning_test_mapping: {
        Row: {
          confidence_score: number | null
          content_category: string | null
          content_title: string | null
          created_at: string | null
          created_by: string | null
          difficulty_level: number | null
          estimated_study_time: number | null
          id: string
          learning_content_id: string
          mapping_source: string | null
          relationship_type: string | null
          subject_area: string | null
          test_question_ids: string[] | null
          topic_category: string | null
          unified_cpl_question_ids: string[] | null
          updated_at: string | null
          verification_status: string | null
          weight_score: number | null
        }
        Insert: {
          confidence_score?: number | null
          content_category?: string | null
          content_title?: string | null
          created_at?: string | null
          created_by?: string | null
          difficulty_level?: number | null
          estimated_study_time?: number | null
          id?: string
          learning_content_id: string
          mapping_source?: string | null
          relationship_type?: string | null
          subject_area?: string | null
          test_question_ids?: string[] | null
          topic_category?: string | null
          unified_cpl_question_ids?: string[] | null
          updated_at?: string | null
          verification_status?: string | null
          weight_score?: number | null
        }
        Update: {
          confidence_score?: number | null
          content_category?: string | null
          content_title?: string | null
          created_at?: string | null
          created_by?: string | null
          difficulty_level?: number | null
          estimated_study_time?: number | null
          id?: string
          learning_content_id?: string
          mapping_source?: string | null
          relationship_type?: string | null
          subject_area?: string | null
          test_question_ids?: string[] | null
          topic_category?: string | null
          unified_cpl_question_ids?: string[] | null
          updated_at?: string | null
          verification_status?: string | null
          weight_score?: number | null
        }
        Relationships: []
      }
      missions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          min_rank_required:
            | Database["public"]["Enums"]["user_rank_type"]
            | null
          mission_type: string | null
          required_action: string
          title: string
          updated_at: string | null
          xp_reward: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          min_rank_required?:
            | Database["public"]["Enums"]["user_rank_type"]
            | null
          mission_type?: string | null
          required_action: string
          title: string
          updated_at?: string | null
          xp_reward?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          min_rank_required?:
            | Database["public"]["Enums"]["user_rank_type"]
            | null
          mission_type?: string | null
          required_action?: string
          title?: string
          updated_at?: string | null
          xp_reward?: number | null
        }
        Relationships: []
      }
      ppl_rank_definitions: {
        Row: {
          category_code: string | null
          color: string | null
          created_at: string | null
          description: string | null
          display_order: number
          icon: string | null
          id: string
          parent_rank_code: string | null
          phase: number | null
          rank_code: string
          rank_level: number
          rank_name: string
          required_content_ids: string[] | null
          section_code: string | null
          subject_code: string | null
          updated_at: string | null
        }
        Insert: {
          category_code?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_order: number
          icon?: string | null
          id?: string
          parent_rank_code?: string | null
          phase?: number | null
          rank_code: string
          rank_level: number
          rank_name: string
          required_content_ids?: string[] | null
          section_code?: string | null
          subject_code?: string | null
          updated_at?: string | null
        }
        Update: {
          category_code?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          parent_rank_code?: string | null
          phase?: number | null
          rank_code?: string
          rank_level?: number
          rank_name?: string
          required_content_ids?: string[] | null
          section_code?: string | null
          subject_code?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ppl_rank_definitions_parent_rank_code_fkey"
            columns: ["parent_rank_code"]
            isOneToOne: false
            referencedRelation: "ppl_rank_definitions"
            referencedColumns: ["rank_code"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          leaderboard_display_name: string | null
          leaderboard_opt_in: boolean
          password_updated_at: string | null
          rank: Database["public"]["Enums"]["user_rank_type"] | null
          roll: string | null
          social_links: Json | null
          updated_at: string | null
          username: string | null
          website: string | null
          xp_points: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          leaderboard_display_name?: string | null
          leaderboard_opt_in?: boolean
          password_updated_at?: string | null
          rank?: Database["public"]["Enums"]["user_rank_type"] | null
          roll?: string | null
          social_links?: Json | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
          xp_points?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          leaderboard_display_name?: string | null
          leaderboard_opt_in?: boolean
          password_updated_at?: string | null
          rank?: Database["public"]["Enums"]["user_rank_type"] | null
          roll?: string | null
          social_links?: Json | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
          xp_points?: number | null
        }
        Relationships: []
      }
      quiz_sessions: {
        Row: {
          answers: Json | null
          completed_at: string | null
          created_at: string | null
          id: string
          is_completed: boolean | null
          questions_attempted: number | null
          questions_correct: number | null
          score_percentage: number | null
          session_type: string
          settings: Json
          started_at: string | null
          subject_breakdown: Json | null
          total_time_spent: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          answers?: Json | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          questions_attempted?: number | null
          questions_correct?: number | null
          score_percentage?: number | null
          session_type?: string
          settings?: Json
          started_at?: string | null
          subject_breakdown?: Json | null
          total_time_spent?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          answers?: Json | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          questions_attempted?: number | null
          questions_correct?: number | null
          score_percentage?: number | null
          session_type?: string
          settings?: Json
          started_at?: string | null
          subject_breakdown?: Json | null
          total_time_spent?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      rank_requirements: {
        Row: {
          alternative_group: string | null
          created_at: string | null
          description: string | null
          display_name: string | null
          icon: string | null
          id: string
          is_required: boolean | null
          priority: number | null
          rank: Database["public"]["Enums"]["user_rank_type"]
          requirement_config: Json | null
          requirement_type: string
          requirement_value: number
          updated_at: string | null
        }
        Insert: {
          alternative_group?: string | null
          created_at?: string | null
          description?: string | null
          display_name?: string | null
          icon?: string | null
          id?: string
          is_required?: boolean | null
          priority?: number | null
          rank: Database["public"]["Enums"]["user_rank_type"]
          requirement_config?: Json | null
          requirement_type: string
          requirement_value: number
          updated_at?: string | null
        }
        Update: {
          alternative_group?: string | null
          created_at?: string | null
          description?: string | null
          display_name?: string | null
          icon?: string | null
          id?: string
          is_required?: boolean | null
          priority?: number | null
          rank?: Database["public"]["Enums"]["user_rank_type"]
          requirement_config?: Json | null
          requirement_type?: string
          requirement_value?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      streak_records: {
        Row: {
          created_at: string | null
          current_streak: number | null
          id: string
          last_activity_date: string | null
          longest_streak: number | null
          streak_freeze_count: number | null
          streak_multiplier: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          streak_freeze_count?: number | null
          streak_multiplier?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          streak_freeze_count?: number | null
          streak_multiplier?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "streak_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      unified_cpl_questions: {
        Row: {
          appearance_frequency: number | null
          applicable_exams: string[]
          correct_answer: number | null
          created_at: string | null
          detailed_topic: string | null
          difficulty_level: number | null
          duplicate_group_id: string | null
          exam_type: string | null
          explanation: string | null
          id: string
          importance_score: number | null
          is_canonical: boolean | null
          main_subject: string
          options: Json
          quality_score: number | null
          question_text: string
          similarity_score: number | null
          source_documents: Json
          sub_subject: string
          tags: string[] | null
          updated_at: string | null
          verification_status: string | null
        }
        Insert: {
          appearance_frequency?: number | null
          applicable_exams?: string[]
          correct_answer?: number | null
          created_at?: string | null
          detailed_topic?: string | null
          difficulty_level?: number | null
          duplicate_group_id?: string | null
          exam_type?: string | null
          explanation?: string | null
          id?: string
          importance_score?: number | null
          is_canonical?: boolean | null
          main_subject: string
          options: Json
          quality_score?: number | null
          question_text: string
          similarity_score?: number | null
          source_documents?: Json
          sub_subject: string
          tags?: string[] | null
          updated_at?: string | null
          verification_status?: string | null
        }
        Update: {
          appearance_frequency?: number | null
          applicable_exams?: string[]
          correct_answer?: number | null
          created_at?: string | null
          detailed_topic?: string | null
          difficulty_level?: number | null
          duplicate_group_id?: string | null
          exam_type?: string | null
          explanation?: string | null
          id?: string
          importance_score?: number | null
          is_canonical?: boolean | null
          main_subject?: string
          options?: Json
          quality_score?: number | null
          question_text?: string
          similarity_score?: number | null
          source_documents?: Json
          sub_subject?: string
          tags?: string[] | null
          updated_at?: string | null
          verification_status?: string | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achieved_at: string | null
          achievement_type: string
          created_at: string | null
          id: string
          is_notified: boolean | null
          metadata: Json | null
          user_id: string | null
          xp_bonus: number | null
        }
        Insert: {
          achieved_at?: string | null
          achievement_type: string
          created_at?: string | null
          id?: string
          is_notified?: boolean | null
          metadata?: Json | null
          user_id?: string | null
          xp_bonus?: number | null
        }
        Update: {
          achieved_at?: string | null
          achievement_type?: string
          created_at?: string | null
          id?: string
          is_notified?: boolean | null
          metadata?: Json | null
          user_id?: string | null
          xp_bonus?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_learning_profiles: {
        Row: {
          created_at: string | null
          current_level: number | null
          current_streak_days: number | null
          daily_study_goal_minutes: number | null
          id: string
          learning_preferences: Json | null
          learning_style: string | null
          longest_streak_days: number | null
          mastery_scores: Json | null
          preferred_difficulty: string | null
          strong_subjects: string[] | null
          target_test_date: string | null
          updated_at: string | null
          user_id: string | null
          weak_subjects: string[] | null
          weekly_study_goal_minutes: number | null
        }
        Insert: {
          created_at?: string | null
          current_level?: number | null
          current_streak_days?: number | null
          daily_study_goal_minutes?: number | null
          id?: string
          learning_preferences?: Json | null
          learning_style?: string | null
          longest_streak_days?: number | null
          mastery_scores?: Json | null
          preferred_difficulty?: string | null
          strong_subjects?: string[] | null
          target_test_date?: string | null
          updated_at?: string | null
          user_id?: string | null
          weak_subjects?: string[] | null
          weekly_study_goal_minutes?: number | null
        }
        Update: {
          created_at?: string | null
          current_level?: number | null
          current_streak_days?: number | null
          daily_study_goal_minutes?: number | null
          id?: string
          learning_preferences?: Json | null
          learning_style?: string | null
          longest_streak_days?: number | null
          mastery_scores?: Json | null
          preferred_difficulty?: string | null
          strong_subjects?: string[] | null
          target_test_date?: string | null
          updated_at?: string | null
          user_id?: string | null
          weak_subjects?: string[] | null
          weekly_study_goal_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_learning_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_missions: {
        Row: {
          completed_at: string | null
          mission_id: string
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          completed_at?: string | null
          mission_id: string
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          completed_at?: string | null
          mission_id?: string
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_missions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_missions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notification_settings: {
        Row: {
          announcement_enabled: boolean | null
          created_at: string | null
          email_notifications_enabled: boolean | null
          id: string
          learning_reminder_enabled: boolean | null
          mission_update_enabled: boolean | null
          new_content_enabled: boolean | null
          notification_time: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          announcement_enabled?: boolean | null
          created_at?: string | null
          email_notifications_enabled?: boolean | null
          id?: string
          learning_reminder_enabled?: boolean | null
          mission_update_enabled?: boolean | null
          new_content_enabled?: boolean | null
          notification_time?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          announcement_enabled?: boolean | null
          created_at?: string | null
          email_notifications_enabled?: boolean | null
          id?: string
          learning_reminder_enabled?: boolean | null
          mission_update_enabled?: boolean | null
          new_content_enabled?: boolean | null
          notification_time?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_ppl_ranks: {
        Row: {
          earned_at: string | null
          id: string
          rank_code: string
          user_id: string
        }
        Insert: {
          earned_at?: string | null
          id?: string
          rank_code: string
          user_id: string
        }
        Update: {
          earned_at?: string | null
          id?: string
          rank_code?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_ppl_ranks_rank_code_fkey"
            columns: ["rank_code"]
            isOneToOne: false
            referencedRelation: "ppl_rank_definitions"
            referencedColumns: ["rank_code"]
          },
          {
            foreignKeyName: "user_ppl_ranks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_test_results: {
        Row: {
          answered_at: string | null
          correct_answer: number | null
          created_at: string | null
          difficulty_level: number | null
          id: string
          is_correct: boolean
          learning_content_id: string | null
          question_id: string
          question_text: string | null
          response_time_seconds: number | null
          session_id: string | null
          subject_category: string | null
          unified_question_id: string | null
          user_answer: number | null
          user_id: string | null
        }
        Insert: {
          answered_at?: string | null
          correct_answer?: number | null
          created_at?: string | null
          difficulty_level?: number | null
          id?: string
          is_correct: boolean
          learning_content_id?: string | null
          question_id: string
          question_text?: string | null
          response_time_seconds?: number | null
          session_id?: string | null
          subject_category?: string | null
          unified_question_id?: string | null
          user_answer?: number | null
          user_id?: string | null
        }
        Update: {
          answered_at?: string | null
          correct_answer?: number | null
          created_at?: string | null
          difficulty_level?: number | null
          id?: string
          is_correct?: boolean
          learning_content_id?: string | null
          question_id?: string
          question_text?: string | null
          response_time_seconds?: number | null
          session_id?: string | null
          subject_category?: string | null
          unified_question_id?: string | null
          user_answer?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_test_results_unified_fk"
            columns: ["unified_question_id"]
            isOneToOne: false
            referencedRelation: "unified_cpl_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_test_results_unified_fk"
            columns: ["unified_question_id"]
            isOneToOne: false
            referencedRelation: "v_mapped_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_test_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_unified_srs_status: {
        Row: {
          ease_factor: number | null
          interval_days: number | null
          last_attempt_record_id: string | null
          next_review_date: string | null
          question_id: string
          repetitions: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ease_factor?: number | null
          interval_days?: number | null
          last_attempt_record_id?: string | null
          next_review_date?: string | null
          question_id: string
          repetitions?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ease_factor?: number | null
          interval_days?: number | null
          last_attempt_record_id?: string | null
          next_review_date?: string | null
          question_id?: string
          repetitions?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_unified_srs_status_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "unified_cpl_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_unified_srs_status_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "v_mapped_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_unified_srs_status_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_weak_areas: {
        Row: {
          accuracy_rate: number
          attempt_count: number | null
          first_identified: string | null
          id: string
          improvement_trend: string | null
          last_updated: string | null
          priority_level: number | null
          sub_category: string | null
          subject_category: string
          user_id: string
        }
        Insert: {
          accuracy_rate: number
          attempt_count?: number | null
          first_identified?: string | null
          id?: string
          improvement_trend?: string | null
          last_updated?: string | null
          priority_level?: number | null
          sub_category?: string | null
          subject_category: string
          user_id: string
        }
        Update: {
          accuracy_rate?: number
          attempt_count?: number | null
          first_identified?: string | null
          id?: string
          improvement_trend?: string | null
          last_updated?: string | null
          priority_level?: number | null
          sub_category?: string | null
          subject_category?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      learning_content_stats: {
        Row: {
          comments_count: number | null
          content_id: string | null
          likes_count: number | null
          views_count: number | null
        }
        Relationships: []
      }
      v_mapped_questions: {
        Row: {
          appearance_frequency: number | null
          correct_answer: number | null
          created_at: string | null
          detailed_topic: string | null
          difficulty_level: number | null
          duplicate_group_id: string | null
          exam_type: string | null
          explanation: string | null
          id: string | null
          importance_score: number | null
          is_canonical: boolean | null
          learning_content_id: string | null
          main_subject: string | null
          options: Json | null
          quality_score: number | null
          question_text: string | null
          similarity_score: number | null
          source_documents: Json | null
          sub_subject: string | null
          tags: string[] | null
          updated_at: string | null
          verification_status: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      award_article_xp: {
        Args: { p_article_slug: string; p_user_id: string; p_xp_amount: number }
        Returns: Json
      }
      calculate_importance_score: {
        Args: {
          difficulty_score: number
          frequency_score: number
          recency_score: number
        }
        Returns: number
      }
      calculate_question_similarity: {
        Args: { text1: string; text2: string }
        Returns: number
      }
      calculate_question_weight: {
        Args: { source_docs: Json }
        Returns: number
      }
      calculate_recency_score: {
        Args: { current_year?: number; exam_year: number }
        Returns: number
      }
      check_and_award_ppl_ranks: {
        Args: { p_content_id: string; p_user_id: string }
        Returns: {
          rank_code: string
          rank_name: string
        }[]
      }
      check_password_strength: { Args: { password: string }; Returns: boolean }
      check_rank_requirements: {
        Args: {
          p_rank: Database["public"]["Enums"]["user_rank_type"]
          p_user_id: string
        }
        Returns: Json
      }
      complete_mission: {
        Args: { p_mission_id: string; p_user_id: string }
        Returns: Json
      }
      create_user_learning_profile: {
        Args: { p_user_id: string }
        Returns: string
      }
      detect_duplicate_questions: {
        Args: never
        Returns: {
          duplicate_type: string
          question1_id: string
          question2_id: string
          similarity_score: number
        }[]
      }
      ensure_user_learning_profile: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      generate_learning_recommendations: {
        Args: { p_user_id: string }
        Returns: {
          content_id: string
          content_type: string
          estimated_impact: number
          priority_score: number
          reason: string
        }[]
      }
      get_learning_xp_benchmark: {
        Args: never
        Returns: {
          cohort_n: number
          cohort_percentile: number
          percentile: number
          population_n: number
          rank_tier: Database["public"]["Enums"]["user_rank_type"]
          xp_points: number
        }[]
      }
      get_public_leaderboard: {
        Args: { p_limit?: number }
        Returns: {
          display_name: string
          leaderboard_position: number
          rank: Database["public"]["Enums"]["user_rank_type"]
          xp_points: number
        }[]
      }
      get_unified_statistics: {
        Args: never
        Returns: {
          avg_importance_score: number
          by_difficulty: Json
          by_main_subject: Json
          by_verification_status: Json
          duplicate_groups_count: number
          total_questions: number
        }[]
      }
      get_user_ppl_ranks: {
        Args: { p_user_id: string }
        Returns: {
          category_code: string
          color: string
          earned_at: string
          icon: string
          phase: number
          rank_code: string
          rank_level: number
          rank_name: string
          section_code: string
          subject_code: string
        }[]
      }
      map_exam_subject_to_official: {
        Args: { exam_subject: string }
        Returns: {
          main_subject: string
          sub_subject: string
        }[]
      }
      map_ppl_rank_code_to_user_rank_type: {
        Args: { p_rank_code: string }
        Returns: Database["public"]["Enums"]["user_rank_type"]
      }
      map_quiz_subject_to_official: {
        Args: { quiz_subject: string }
        Returns: {
          main_subject: string
          sub_subject: string
        }[]
      }
      measure_learning_effectiveness: {
        Args: {
          p_content_id: string
          p_measurement_period_days?: number
          p_user_id: string
        }
        Returns: {
          after_accuracy: number
          before_accuracy: number
          improvement_rate: number
          sample_size: number
        }[]
      }
      recalculate_all_user_ranks: { Args: never; Returns: number }
      record_learning_session: {
        Args: {
          p_completion_rate?: number
          p_content_id: string
          p_content_type?: string
          p_session_duration?: number
          p_session_metadata?: Json
          p_session_type: string
          p_user_id: string
        }
        Returns: string
      }
      update_profile_rank_for_ppl: {
        Args: { p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      user_rank_type:
        | "fan"
        | "ppl-aero-basics-phase1"
        | "ppl-aero-basics-phase2"
        | "ppl-aero-basics-master"
        | "ppl-aero-performance-phase1"
        | "ppl-aero-performance-phase2"
        | "ppl-aero-performance-master"
        | "ppl-aerodynamics-master"
        | "ppl-engineering-master"
        | "ppl"
        | "wingman"
        | "cpl"
        | "ace"
        | "master"
        | "legend"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_rank_type: [
        "fan",
        "ppl-aero-basics-phase1",
        "ppl-aero-basics-phase2",
        "ppl-aero-basics-master",
        "ppl-aero-performance-phase1",
        "ppl-aero-performance-phase2",
        "ppl-aero-performance-master",
        "ppl-aerodynamics-master",
        "ppl-engineering-master",
        "ppl",
        "wingman",
        "cpl",
        "ace",
        "master",
        "legend",
      ],
    },
  },
} as const
