import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabaseClient';

const fromSupabase = async (query) => {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

/*
### profiles

| name       | type                    | format | required |
|------------|-------------------------|--------|----------|
| id         | uuid                    | string | true     |
| updated_at | timestamp with time zone| string | false    |
| username   | text                    | string | false    |
| full_name  | text                    | string | false    |
| avatar_url | text                    | string | false    |
| website    | text                    | string | false    |
| email      | text                    | string | false    |
| createc_at | timestamp with time zone| string | false    |
| roll       | text                    | string | false    |

Note: 'id' is the Primary Key.
*/

export const useProfiles = () => useQuery({
  queryKey: ['profiles'],
  queryFn: () => fromSupabase(supabase.from('profiles').select('*')),
});

export const useProfile = (id) => useQuery({
  queryKey: ['profiles', id],
  queryFn: () => fromSupabase(supabase.from('profiles').select('*').eq('id', id).single()),
});

export const useAddProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newProfile) => fromSupabase(supabase.from('profiles').insert([newProfile])),
    onSuccess: () => {
      queryClient.invalidateQueries('profiles');
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updateData }) => fromSupabase(supabase.from('profiles').update(updateData).eq('id', id)),
    onSuccess: () => {
      queryClient.invalidateQueries('profiles');
    },
  });
};

export const useDeleteProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => fromSupabase(supabase.from('profiles').delete().eq('id', id)),
    onSuccess: () => {
      queryClient.invalidateQueries('profiles');
    },
  });
};