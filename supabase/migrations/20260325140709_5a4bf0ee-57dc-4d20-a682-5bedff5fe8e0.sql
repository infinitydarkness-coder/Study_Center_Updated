
-- Create departments table (branches like Computer Engineering, AIML)
CREATE TABLE public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view departments" ON public.departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert departments" ON public.departments FOR INSERT WITH CHECK (get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Admins can update departments" ON public.departments FOR UPDATE USING (get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Admins can delete departments" ON public.departments FOR DELETE USING (get_user_role(auth.uid()) = 'admin');

-- Create semesters table
CREATE TABLE public.semesters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  department_id uuid NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view semesters" ON public.semesters FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert semesters" ON public.semesters FOR INSERT WITH CHECK (get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Admins can update semesters" ON public.semesters FOR UPDATE USING (get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Admins can delete semesters" ON public.semesters FOR DELETE USING (get_user_role(auth.uid()) = 'admin');

-- Add semester_id to subjects (keep course_id for backward compat)
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS semester_id uuid REFERENCES public.semesters(id) ON DELETE CASCADE;
ALTER TABLE public.subjects ALTER COLUMN course_id DROP NOT NULL;

-- Add department_id and semester_id to uploads for categorization
ALTER TABLE public.uploads ADD COLUMN IF NOT EXISTS department_id uuid REFERENCES public.departments(id);
ALTER TABLE public.uploads ADD COLUMN IF NOT EXISTS semester_id uuid REFERENCES public.semesters(id);
