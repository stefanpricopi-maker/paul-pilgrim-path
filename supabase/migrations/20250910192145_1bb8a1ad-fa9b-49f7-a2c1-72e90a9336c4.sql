-- Create audit_log table for tracking admin actions and system events
CREATE TABLE public.audit_log (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  action_category TEXT NOT NULL, -- 'admin', 'player', 'system', 'game'
  target_type TEXT, -- 'game', 'player', 'setting', 'card', etc.
  target_id TEXT, -- ID of the affected resource
  description TEXT NOT NULL,
  details JSONB, -- Additional structured data
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
CREATE POLICY "Admins can read audit logs" 
ON public.audit_log 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND is_admin = true
));

-- System and admins can insert audit logs
CREATE POLICY "System can insert audit logs" 
ON public.audit_log 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Add indexes for better performance
CREATE INDEX idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON public.audit_log(created_at DESC);
CREATE INDEX idx_audit_log_action_category ON public.audit_log(action_category);
CREATE INDEX idx_audit_log_target_type ON public.audit_log(target_type);

-- Create function to automatically log admin actions
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_action_type TEXT,
  p_action_category TEXT,
  p_target_type TEXT DEFAULT NULL,
  p_target_id TEXT DEFAULT NULL,
  p_description TEXT DEFAULT '',
  p_details JSONB DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_log (
    user_id,
    action_type,
    action_category,
    target_type,
    target_id,
    description,
    details,
    created_at
  ) VALUES (
    auth.uid(),
    p_action_type,
    p_action_category,
    p_target_type,
    p_target_id,
    p_description,
    p_details,
    NOW()
  );
END;
$$;