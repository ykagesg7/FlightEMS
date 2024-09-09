import { supabase } from '../../lib/supabaseClient';
import { SupabaseAuthProvider, useSupabaseAuth, SupabaseAuthUI } from './auth.jsx';
import {
  useProfiles,
  useProfile,
  useAddProfile,
  useUpdateProfile,
  useDeleteProfile,
} from './hooks/profiles';
import {
  useQuizQuestions,
  useQuizQuestion,
  useAddQuizQuestion,
  useUpdateQuizQuestion,
  useDeleteQuizQuestion,
} from './hooks/quiz_questions';

export {
  supabase,
  SupabaseAuthProvider,
  useSupabaseAuth,
  SupabaseAuthUI,
  useProfiles,
  useProfile,
  useAddProfile,
  useUpdateProfile,
  useDeleteProfile,
  useQuizQuestions,
  useQuizQuestion,
  useAddQuizQuestion,
  useUpdateQuizQuestion,
  useDeleteQuizQuestion,
};