import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabaseClient';

const fromSupabase = async (query) => {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

/*
### quiz_questions

| name        | type   | format | required |
|-------------|--------|--------|----------|
| id          | bigint | integer| true     |
| category    | text   | string | true     |
| question    | text   | string | false    |
| answer1     | text   | string | false    |
| answer2     | text   | string | false    |
| answer3     | text   | string | false    |
| answer4     | text   | string | false    |
| correct     | bigint | integer| false    |
| explanation | text   | string | false    |

Note: 'id' is the Primary Key.
This is a Commerce Pilot's questions (about 500)
*/

export const useQuizQuestions = () => useQuery({
  queryKey: ['quiz_questions'],
  queryFn: () => fromSupabase(supabase.from('quiz_questions').select('*')),
});

export const useQuizQuestion = (id) => useQuery({
  queryKey: ['quiz_questions', id],
  queryFn: () => fromSupabase(supabase.from('quiz_questions').select('*').eq('id', id).single()),
});

export const useAddQuizQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newQuestion) => fromSupabase(supabase.from('quiz_questions').insert([newQuestion])),
    onSuccess: () => {
      queryClient.invalidateQueries('quiz_questions');
    },
  });
};

export const useUpdateQuizQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updateData }) => fromSupabase(supabase.from('quiz_questions').update(updateData).eq('id', id)),
    onSuccess: () => {
      queryClient.invalidateQueries('quiz_questions');
    },
  });
};

export const useDeleteQuizQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => fromSupabase(supabase.from('quiz_questions').delete().eq('id', id)),
    onSuccess: () => {
      queryClient.invalidateQueries('quiz_questions');
    },
  });
};