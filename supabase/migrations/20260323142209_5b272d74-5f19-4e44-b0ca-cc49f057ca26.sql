
-- Create the trigger that was missing
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert the missing profile for the existing user
INSERT INTO public.profiles (id, name, role, course)
VALUES (
  '2307a412-2ae2-4693-83b7-1acc9af874fa',
  'Sanskar Rajesh Vaze',
  'student',
  'IT'
)
ON CONFLICT (id) DO NOTHING;
