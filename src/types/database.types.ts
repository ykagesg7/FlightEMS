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
          social_links: Json | null
          bio: string | null
          password_updated_at: string | null
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
          social_links?: Json | null
          bio?: string | null
          password_updated_at?: string | null
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
          social_links?: Json | null
          bio?: string | null
          password_updated_at?: string | null
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
          content        Update: {
  id ?: string
  content_id ?: string
  user_id ?: string | null
  session_id ?: string | null
  ip_address ?: string | null
  created_at ?: string
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
  ed_at: string
}
Insert: {
  id ?: string
  content_id: string
  user_id ?: string | null
  session_id ?: string | null
  ip_address ?: string | null
  created_at ?: string
}
Update: {
  id ?: string
  content_id ?: string
  user_id ?: string | nul      learning_content_comments: {
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
      explanation: string | null
      difficulty_level: string
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
      explanation ?: string | null
      difficulty_level ?: string
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
      explanation ?: string | null
      difficulty_level ?: string
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
  } content_id ?: string
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
    }
Views: {
  [_ in never]: never
}
Functions: {
  [_ in never]: never
}
Enums: {
  [_ in never]: never
}
CompositeTypes: {
  [_ in never]: never
}
  }
}
