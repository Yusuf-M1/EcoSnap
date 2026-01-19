"use client";
import { motion } from 'framer-motion';
import { supabase } from '../app/utils/supabaseClient';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function Layout({ children, user, title }) {
    const router = useRouter();

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            toast.error('Logout failed');
        } else {
            toast.success('Logged out successfully');
            router.push('/');
        }
    };

    return (
        <div className="min-h-screen p-6 text-white">
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="glass p-4 rounded-xl mb-8 flex justify-between items-center"
            >
                <h1 className="text-2xl font-bold">{title}</h1>
                {user && (
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm opacity-80">Hello, {user.username}</p>
                            <div className="flex items-center gap-3 mt-1">
                                <p className="text-xl font-bold text-green-300">{user.points} XP</p>
                                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                                    Level {user.level}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="btn-glass px-4 py-2 rounded-lg hover:bg-red-500/20 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </motion.header>
            {children}
        </div>
    );
}

