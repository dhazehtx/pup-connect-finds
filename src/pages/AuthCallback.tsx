
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          toast({
            title: "Authentication Error",
            description: error.message,
            variant: "destructive",
          });
          navigate('/auth');
          return;
        }

        if (data.session) {
          // Check if this is a new user and create/update profile if needed
          const { user } = data.session;
          
          if (user) {
            // Check if profile exists
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('id')
              .eq('id', user.id)
              .single();

            // If no profile exists, create one with social provider info
            if (!profile && !profileError) {
              const { error: insertError } = await supabase
                .from('profiles')
                .insert({
                  id: user.id,
                  email: user.email,
                  full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
                  username: user.user_metadata?.preferred_username || user.email?.split('@')[0] || '',
                  avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
                  social_providers: {
                    [user.app_metadata?.provider || 'unknown']: true
                  }
                });

              if (insertError) {
                console.error('Error creating profile:', insertError);
              }
            }
          }

          toast({
            title: "Welcome!",
            description: "You've been successfully logged in.",
          });
          
          navigate('/home');
        } else {
          navigate('/auth');
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred during authentication.",
          variant: "destructive",
        });
        navigate('/auth');
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
