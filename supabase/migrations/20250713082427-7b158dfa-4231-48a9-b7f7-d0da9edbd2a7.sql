
-- Add foreign key constraint to link school_users.user_id to profiles.id
ALTER TABLE public.school_users 
ADD CONSTRAINT school_users_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
