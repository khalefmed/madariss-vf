
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    
    console.log('🔄 Auth: Initializing auth provider');

    // Get initial session
    const initializeAuth = async () => {
      try {
        console.log('🔍 Auth: Getting initial session');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) {
          console.log('⚠️ Auth: Component unmounted, skipping session setup');
          return;
        }
        
        if (error) {
          console.error('❌ Auth: Error getting initial session:', error);
          setSession(null);
          setUser(null);
        } else {
          console.log('✅ Auth: Initial session:', session?.user?.id || 'No session');
          setSession(session);
          setUser(session?.user ?? null);
        }
        
        setLoading(false);
        console.log('✅ Auth: Initial loading complete');
        
      } catch (error) {
        console.error('💥 Auth: Failed to initialize:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔔 Auth: State change event:', event, session?.user?.id || 'No session');
        
        if (!mounted) {
          console.log('⚠️ Auth: Component unmounted, ignoring auth state change');
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_OUT') {
          console.log('👋 Auth: User signed out, clearing state');
          // Clear state immediately
          setSession(null);
          setUser(null);
          
          // Navigate to auth page after state is cleared
          setTimeout(() => {
            if (window.location.pathname !== '/auth' && window.location.pathname !== '/') {
              console.log('🔄 Auth: Redirecting to /auth');
              window.location.href = '/auth';
            }
          }, 100);
        }
      }
    );

    // Initialize auth
    initializeAuth();

    return () => {
      console.log('🧹 Auth: Cleaning up auth provider');
      mounted = false;
      subscription.unsubscribe();
    };
  }, [toast]);

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Auth: Attempting sign in for:', email);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Auth: Sign in error:', error.message);
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.log('✅ Auth: Sign in successful');
      }

      return { error };
    } catch (error) {
      console.error('💥 Auth: Sign in exception:', error);
      return { error };
    }
  };

  const signOut = async () => {
    console.log('👋 Auth: Starting sign out process');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Auth: Sign out error:', error);
        throw error;
      } else {
        console.log('✅ Auth: Sign out API call successful');
      }
    } catch (error) {
      console.error('💥 Auth: Sign out exception:', error);
      throw error;
    }
  };

  console.log('🎭 Auth: Rendering with state:', { 
    hasUser: !!user, 
    hasSession: !!session, 
    loading,
    userId: user?.id
  });

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
