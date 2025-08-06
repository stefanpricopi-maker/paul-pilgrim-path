import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Clean up auth state utility
  const cleanupAuthState = useCallback(() => {
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Remove from sessionStorage if in use
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    try {
      // Clean up existing state
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: displayName ? { display_name: displayName } : undefined
        }
      });

      if (error) throw error;

      toast({
        title: "Account Created!",
        description: "Please check your email to verify your account.",
      });

      return { data, error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred during sign up';
      toast({
        title: "Sign Up Failed",
        description: message,
        variant: "destructive"
      });
      return { data: null, error };
    }
  }, [cleanupAuthState]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      // Clean up existing state
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Welcome Back!",
          description: "Successfully signed in to your account.",
        });
        // Force page reload for clean state
        window.location.href = '/';
      }

      return { data, error: null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred during sign in';
      toast({
        title: "Sign In Failed",
        description: message,
        variant: "destructive"
      });
      return { data: null, error };
    }
  }, [cleanupAuthState]);

  const signOut = useCallback(async () => {
    try {
      // Clean up auth state
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Ignore errors
      }

      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });

      // Force page reload for clean state
      window.location.href = '/auth';
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred during sign out';
      toast({
        title: "Sign Out Failed",
        description: message,
        variant: "destructive"
      });
    }
  }, [cleanupAuthState]);

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };
};