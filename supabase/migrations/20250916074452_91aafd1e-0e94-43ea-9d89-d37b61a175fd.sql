-- Security Hardening - Part 4: Fix Function Search Path Issues

-- Update all existing functions to have proper search_path settings
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
begin
  insert into public.profiles (id, username, full_name)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$;

CREATE OR REPLACE FUNCTION public.ensure_admin(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
begin
  insert into profiles (id, is_admin)
  values (user_id, true)
  on conflict (id) 
  do update set is_admin = true;
end;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.audit_log 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.debug_admin_status(uid uuid)
RETURNS TABLE(found boolean, profile_id uuid, is_admin boolean)
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
declare r record;
begin
  select id, is_admin into r
  from public.profiles
  where id = uid;

  if not found then
    return query select false, null::uuid, null::boolean;
  end if;

  return query select true, r.id, r.is_admin;
end;
$$;