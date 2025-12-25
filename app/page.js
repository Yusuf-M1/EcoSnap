"use client";
import { useState, useEffect } from 'react';
import { supabase } from './utils/supabaseClient';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Leaf, User, Shield } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', username: '', role: 'HELPER' });

  // --- THE FIX: Listen for Email Verification ---
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // User just verified their email or logged in!
        // Check their role and redirect them.
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (profile?.role === 'AUTHORITY') router.push('/authority');
        else router.push('/helper');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);
  // ----------------------------------------------

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      // LOGIN
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      if (error) alert(error.message);
      // The useEffect above will handle the redirect on success
    } else {
      // SIGN UP
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          emailRedirectTo: `${window.location.origin}`, // Ensures they come back to this page
          data: { username: form.username, role: form.role },
        },
      });

      if (error) {
        alert(error.message);
      } else {
        if (data?.user) {
          // Create Profile manually
          await supabase.from('profiles').insert([
             { id: data.user.id, username: form.username, role: form.role }
          ]);
          alert("Link sent! Check your email to finish.");
          setIsLogin(true);
        }
      }
    }
    setLoading(false);
  };

  return (
    <div className="nature-bg flex flex-col min-h-screen">
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2 font-bold text-2xl text-white">
          <Leaf className="text-green-400" /> EcoSnap
        </div>
        <button onClick={() => setIsLogin(!isLogin)} className="text-white/80 hover:text-white transition">
          {isLogin ? "Create Account" : "Login"}
        </button>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mb-12">
          <h1 className="text-6xl md:text-7xl font-extrabold mb-6 leading-tight drop-shadow-lg">
            Snap. Report. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
              Save Earth.
            </span>
          </h1>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-left">{isLogin ? "Welcome Back" : "Get Started"}</h2>
          
          <form onSubmit={handleAuth} className="space-y-4 text-left">
            {!isLogin && (
              <>
                <input type="text" placeholder="Username" className="w-full p-4 rounded-xl input-field"
                  onChange={e => setForm({...form, username: e.target.value})} required />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-3 rounded-xl border cursor-pointer flex flex-col items-center gap-2 transition ${form.role === 'HELPER' ? 'bg-green-500/20 border-green-500' : 'border-white/20 hover:bg-white/5'}`}
                    onClick={() => setForm({...form, role: 'HELPER'})}>
                    <User size={20} /> <span className="text-sm">Helper</span>
                  </div>
                  <div className={`p-3 rounded-xl border cursor-pointer flex flex-col items-center gap-2 transition ${form.role === 'AUTHORITY' ? 'bg-blue-500/20 border-blue-500' : 'border-white/20 hover:bg-white/5'}`}
                    onClick={() => setForm({...form, role: 'AUTHORITY'})}>
                    <Shield size={20} /> <span className="text-sm">Authority</span>
                  </div>
                </div>
              </>
            )}

            <input type="email" placeholder="Email" className="w-full p-4 rounded-xl input-field"
              onChange={e => setForm({...form, email: e.target.value})} required />

            <input type="password" placeholder="Password" className="w-full p-4 rounded-xl input-field"
              onChange={e => setForm({...form, password: e.target.value})} required />

            <button type="submit" disabled={loading} className="w-full btn-primary py-4 rounded-xl font-bold text-lg mt-2">
              {loading ? 'Processing...' : (isLogin ? 'Login' : 'Create Account')}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}