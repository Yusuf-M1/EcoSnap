import { useState, useEffect } from 'react';
import { supabase } from '../app/utils/supabaseClient';
import { useRouter } from 'next/navigation';

export function useAuth(requiredRole = null) {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { user: authUser } } = await supabase.auth.getUser();

                if (!authUser) {
                    router.push('/');
                    return;
                }

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', authUser.id)
                    .single();

                if (requiredRole && profile?.role !== requiredRole) {
                    // Redirect based on their actual role
                    if (profile?.role === 'AUTHORITY') router.push('/authority');
                    else router.push('/helper');
                    return;
                }

                setUser(profile);
            } catch (error) {
                console.error('Auth error:', error);
                router.push('/');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [requiredRole, router]);

    return { user, loading };
}
