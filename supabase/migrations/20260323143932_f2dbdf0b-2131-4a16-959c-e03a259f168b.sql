
-- Create categories table
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert categories" ON public.categories FOR INSERT WITH CHECK (get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Admins can update categories" ON public.categories FOR UPDATE USING (get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Admins can delete categories" ON public.categories FOR DELETE USING (get_user_role(auth.uid()) = 'admin');

-- Add delete_requested status support: add a column for delete request reason
ALTER TABLE public.uploads ADD COLUMN IF NOT EXISTS delete_requested boolean NOT NULL DEFAULT false;
ALTER TABLE public.uploads ADD COLUMN IF NOT EXISTS delete_reason text;

-- Allow students to update their own uploads (for requesting delete)
CREATE POLICY "Students can update own uploads" ON public.uploads FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Allow admins to delete uploads
CREATE POLICY "Admins can delete uploads" ON public.uploads FOR DELETE USING (get_user_role(auth.uid()) = 'admin');
