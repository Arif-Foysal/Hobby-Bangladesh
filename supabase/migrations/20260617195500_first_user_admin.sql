-- Make the first user to sign up an admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_count INT;
BEGIN
  SELECT COUNT(*) INTO user_count FROM public.profiles;

  INSERT INTO public.profiles (id, name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    CASE WHEN user_count = 0 THEN 'admin' ELSE 'customer' END);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
