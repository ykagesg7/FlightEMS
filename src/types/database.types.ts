export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      announcements: {
        Row: {
          id: number
          title: string
          date: string
        }
        Insert: {
          id?: number
          title: string
          date: string
        }
        Update: {
          id?: number
          title?: string
          date?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          created_at: string | null
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          created_at?: string | null
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          content?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      community: {
        Row: {
          id: number
          title: string
          content: string | null
          user_id: string | null
          created_at: string | null
          like_count: number | null
          comment_count: number | null
          post_id: number | null
        }
        Insert: {
          id?: number
          title: string
          content?: string | null
          user_id?: string | null
          created_at?: string | null
          like_count?: number | null
          comment_count?: number | null
          post_id?: number | null
        }
        Update: {
          id?: number
          title?: string
          content?: string | null
          user_id?: string | null
          created_at?: string | null
          like_count?: number | null
          comment_count?: number | null
          post_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "community_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      likes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      posts: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
          website: string | null
          email: string | null
          created_at: string | null
          roll: string | null
          rank: Database['public']['Enums']['user_rank_type'] | null
          xp_points: number | null
          social_links: Json | null
          bio: string | null
          password_updated_at: string | null
          leaderboard_opt_in: boolean
          leaderboard_display_name: string | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          email?: string | null
          created_at?: string | null
          roll?: string | null
          rank?: Database['public']['Enums']['user_rank_type'] | null
          xp_points?: number | null
          social_links?: Json | null
          bio?: string | null
          password_updated_at?: string | null
          leaderboard_opt_in?: boolean
          leaderboard_display_name?: string | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          email?: string | null
          created_at?: string | null
          roll?: string | null
          rank?: Database['public']['Enums']['user_rank_type'] | null
          xp_points?: number | null
          social_links?: Json | null
          bio?: string | null
          password_updated_at?: string | null
          leaderboard_opt_in?: boolean
          leaderboard_display_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          completed_units: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          completed_units?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          completed_units?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      learning_contents: {
        Row: {
          id: string
          title: string
          category: string
          sub_category: string | null
          description: string | null
          order_index: number
          parent_id: string | null
          content_type: string
          created_at: string
          updated_at: string
          is_published: boolean
        }
        Insert: {
          id?: string
          title: string
          category: string
          sub_category?: string | null
          description?: string | null
          order_index?: number
          parent_id?: string | null
          content_type: string
          created_at?: string
          updated_at?: string
          is_published?: boolean
        }
        Update: {
          id?: string
          title?: string
          category?: string
          sub_category?: string | null
          description?: string | null
          order_index?: number
          parent_id?: string | null
          content_type?: string
          created_at?: string
          updated_at?: string
          is_published?: boolean
        }
      }
      learning_progress: {
        Row: {
          id: string
          user_id: string
          content_id: string
          completed: boolean
          progress_percentage: number
          last_position: number
          last_read_at: string
          read_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content_id: string
          completed?: boolean
          progress_percentage?: number
          last_position?: number
          last_read_at?: string
          read_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content_id?: string
          completed?: boolean
          progress_percentage?: number
          last_position?: number
          last_read_at?: string
          read_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      learning_content_views: {
        Row: {
          id: string
          content_id: string
          user_id: string | null
          session_id: string | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          content_id: string
          user_id?: string | null
          session_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          content_id?: string
          user_id?: string | null
          session_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_content_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      learning_content_likes: {
        Row: {
          id: string
          content_id: string
          user_id: string | null
          session_id: string | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          content_id: string
          user_id?: string | null
          session_id?: string | null
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          content_id?: string
          user_id?: string | null
          session_id?: string | null
          ip_address?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_content_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      learning_content_comments: {
    Row: {
      id: string
      content_id: string
      user_id: string
      content: string
      created_at: string
      updated_at: string
    }
    Insert: {
      id ?: string
      content_id: string
      user_id: string
      content: string
      created_at ?: string
      updated_at ?: string
    }
    Update: {
      id ?: string
      content_id ?: string
      user_id ?: string
      content ?: string
      created_at ?: string
      updated_at ?: string
    }
    Relationships: [
      {
        foreignKeyName: "learning_content_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
      }
    ]
  }
  user_test_results: {
    Row: {
      id: string
      user_id: string
      session_id: string
      learning_content_id: string | null
      subject_category: string | null
      unified_question_id: string | null
      is_correct: boolean
      answered_at: string
      created_at: string
    }
    Insert: {
      id ?: string
      user_id: string
      session_id: string
      learning_content_id ?: string | null
      subject_category ?: string | null
      unified_question_id ?: string | null
      is_correct: boolean
      answered_at ?: string
      created_at ?: string
    }
    Update: {
      id ?: string
      user_id ?: string
      session_id ?: string
      learning_content_id ?: string | null
      subject_category ?: string | null
      unified_question_id ?: string | null
      is_correct ?: boolean
      answered_at ?: string
      created_at ?: string
    }
    Relationships: [
      {
        foreignKeyName: "user_test_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
      }
    ]
  }
  unified_cpl_questions: {
    Row: {
      id: string
      main_subject: string
      sub_subject: string | null
      question_text: string
      options: string[]
      correct_option_index: number
      correct_answer?: number
      explanation: string | null
      difficulty_level: string | number
      verification_status?: string
      importance_score?: number
      applicable_exams?: string[]
      created_at: string
      updated_at: string
    }
    Insert: {
      id ?: string
      main_subject: string
      sub_subject ?: string | null
      question_text: string
      options: string[]
      correct_option_index: number
      correct_answer?: number
      explanation ?: string | null
      difficulty_level ?: string | number
      verification_status?: string
      importance_score?: number
      applicable_exams?: string[]
      created_at ?: string
      updated_at ?: string
    }
    Update: {
      id ?: string
      main_subject ?: string
      sub_subject ?: string | null
      question_text ?: string
      options ?: string[]
      correct_option_index ?: number
      correct_answer?: number
      explanation ?: string | null
      difficulty_level ?: string | number
      verification_status?: string
      importance_score?: number
      applicable_exams?: string[]
      created_at ?: string
      updated_at ?: string
    }
    Relationships: []
  }
  user_unified_srs_status: {
    Row: {
      user_id: string
      question_id: string
      next_review_date: string | null
      interval_days: number
      ease_factor: number
      repetitions: number
      last_attempt_record_id: string | null
      updated_at: string
    }
    Insert: {
      user_id: string
      question_id: string
      next_review_date ?: string | null
      interval_days ?: number
      ease_factor ?: number
      repetitions ?: number
      last_attempt_record_id ?: string | null
      updated_at ?: string
    }
    Update: {
      user_id ?: string
      question_id ?: string
      next_review_date ?: string | null
      interval_days ?: number
      ease_factor ?: number
      repetitions ?: number
      last_attempt_record_id ?: string | null
      updated_at ?: string
    }
    Relationships: [
      {
        foreignKeyName: "user_unified_srs_status_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
      }
    ]
  }
  user_notification_settings: {
    Row: {
      id: string
      user_id: string
      learning_reminder_enabled: boolean
      new_content_enabled: boolean
      announcement_enabled: boolean
      mission_update_enabled: boolean
      email_notifications_enabled: boolean
      notification_time: string | null
      created_at: string | null
      updated_at: string | null
    }
    Insert: {
      id ?: string
      user_id: string
      learning_reminder_enabled ?: boolean
      new_content_enabled ?: boolean
      announcement_enabled ?: boolean
      mission_update_enabled ?: boolean
      email_notifications_enabled ?: boolean
      notification_time ?: string | null
      created_at ?: string | null
      updated_at ?: string | null
    }
    Update: {
      id ?: string
      user_id ?: string
      learning_reminder_enabled ?: boolean
      new_content_enabled ?: boolean
      announcement_enabled ?: boolean
      mission_update_enabled ?: boolean
      email_notifications_enabled ?: boolean
      notification_time ?: string | null
      created_at ?: string | null
      updated_at ?: string | null
    }
    Relationships: [
      {
        foreignKeyName: "user_notification_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
      }
    ]
  }
  learning_sessions: {
    Row: {
      id: string
      user_id: string
      session_type: string
      content_id: string
      content_type: string | null
      session_duration: number | null
      completion_rate: number | null
      session_metadata: Json | null
      created_at: string | null
      ended_at: string | null
      duration_minutes: number | null
      status: string | null
      comprehension_score: number | null
      engagement_score: number | null
    }
    Insert: {
      id?: string
      user_id: string
      session_type: string
      content_id: string
      content_type?: string | null
      session_duration?: number | null
      completion_rate?: number | null
      session_metadata?: Json | null
      created_at?: string | null
      ended_at?: string | null
      duration_minutes?: number | null
      status?: string | null
      comprehension_score?: number | null
      engagement_score?: number | null
    }
    Update: {
      id?: string
      user_id?: string
      session_type?: string
      content_id?: string
      content_type?: string | null
      session_duration?: number | null
      completion_rate?: number | null
      session_metadata?: Json | null
      created_at?: string | null
      ended_at?: string | null
      duration_minutes?: number | null
      status?: string | null
      comprehension_score?: number | null
      engagement_score?: number | null
    }
    Relationships: []
  }
  user_learning_profiles: {
    Row: {
      id: string
      user_id: string | null
      current_level: number | null
      learning_style: string | null
      preferred_difficulty: string | null
      target_test_date: string | null
      daily_study_goal_minutes: number | null
      weekly_study_goal_minutes: number | null
      current_streak_days: number | null
      longest_streak_days: number | null
      strong_subjects: string[] | null
      weak_subjects: string[] | null
      mastery_scores: Json | null
      learning_preferences: Json | null
      created_at: string | null
      updated_at: string | null
    }
    Insert: {
      id?: string
      user_id?: string | null
      current_level?: number | null
      learning_style?: string | null
      preferred_difficulty?: string | null
      target_test_date?: string | null
      daily_study_goal_minutes?: number | null
      weekly_study_goal_minutes?: number | null
      current_streak_days?: number | null
      longest_streak_days?: number | null
      strong_subjects?: string[] | null
      weak_subjects?: string[] | null
      mastery_scores?: Json | null
      learning_preferences?: Json | null
      created_at?: string | null
      updated_at?: string | null
    }
    Update: {
      id?: string
      user_id?: string | null
      current_level?: number | null
      learning_style?: string | null
      preferred_difficulty?: string | null
      target_test_date?: string | null
      daily_study_goal_minutes?: number | null
      weekly_study_goal_minutes?: number | null
      current_streak_days?: number | null
      longest_streak_days?: number | null
      strong_subjects?: string[] | null
      weak_subjects?: string[] | null
      mastery_scores?: Json | null
      learning_preferences?: Json | null
      created_at?: string | null
      updated_at?: string | null
    }
    Relationships: []
  }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_learning_xp_benchmark: {
        Args: Record<PropertyKey, never>
        Returns: {
          xp_points: number
          population_n: number
          percentile: number | null
          rank_tier: Database['public']['Enums']['user_rank_type'] | null
          cohort_n: number | null
          cohort_percentile: number | null
        }[]
      }
      get_public_leaderboard: {
        Args: { p_limit?: number }
        Returns: {
          display_name: string
          xp_points: number
          rank: Database['public']['Enums']['user_rank_type'] | null
          leaderboard_position: number
        }[]
      }
    }
    Enums: {
      user_rank_type:
        | 'fan'
        | 'ppl-aero-basics-phase1'
        | 'ppl-aero-basics-phase2'
        | 'ppl-aero-basics-master'
        | 'ppl-aero-performance-phase1'
        | 'ppl-aero-performance-phase2'
        | 'ppl-aero-performance-master'
        | 'ppl-aerodynamics-master'
        | 'ppl-engineering-master'
        | 'ppl'
        | 'wingman'
        | 'cpl'
        | 'ace'
        | 'master'
        | 'legend'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
