import { useState, useEffect } from 'react';
import { supabase } from '../app/utils/supabaseClient';
import { useRouter } from 'next/navigation';

export function useAuth(requiredRole = null) {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

                if (authError) throw authError;

                if (!authUser) {
                    router.push('/');
                    return;
                }

                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', authUser.id)
                    .single();

                if (profileError) throw profileError;

                if (requiredRole && profile?.role !== requiredRole) {
                    // Redirect based on their actual role
                    if (profile?.role === 'AUTHORITY') router.push('/authority');
                    else router.push('/helper');
                    return;
                }

                setUser(profile);
            } catch (err) {
                console.error('Auth error:', err);
                setError(err.message);
                router.push('/');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [requiredRole, router]);

    return { user, loading, error };
}

