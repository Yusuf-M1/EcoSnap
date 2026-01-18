"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from './utils/supabaseClient'; // Ensure this path matches your file structure
import { motion, AnimatePresence } from 'framer-motion';

// --- SUB-COMPONENT: Image Comparison Slider ---
const ImageComparisonSlider = () => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  const handleMove = (event) => {
    if (!containerRef.current) return;

    // Get cursor position (Touch or Mouse)
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const rect = containerRef.current.getBoundingClientRect();

    // Calculate percentage (0 to 100)
    let position = ((clientX - rect.left) / rect.width) * 100;
    position = Math.max(0, Math.min(100, position)); // Clamp between 0 and 100

    setSliderPosition(position);
  };

  const handleMouseDown = () => { isDragging.current = true; };
  const handleMouseUp = () => { isDragging.current = false; };
  const handleMouseMove = (e) => { if (isDragging.current) handleMove(e); };

  return (
    <div
      ref={containerRef}
      className="relative mx-auto w-full max-w-4xl aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl cursor-ew-resize select-none group"
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleMove}
    >
      {/* 1. The "Dirty" Image (Background) */}
      <div className="absolute inset-0 w-full h-full">
        {/* Using standard img for simplicity in resizing */}
        <img
          src="/pollution-before.jpg"
          alt="Polluted"
          className="w-full h-full object-cover grayscale brightness-75"
        />
        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
          Before
        </div>
      </div>

      {/* 2. The "Clean" Image (Foreground - Clipped) */}
      <div
        className="absolute inset-0 h-full overflow-hidden border-r-2 border-white/80"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src="/pollution-after.jpg"
          alt="Restored"
          className="w-full h-full object-cover max-w-none"
          style={{ width: `${containerRef.current?.offsetWidth}px` }} // Keeps aspect ratio fixed
        />
        <div className="absolute top-4 left-4 bg-primary/80 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
          Restored
        </div>
      </div>

      {/* 3. The Slider Handle */}
      <div
        className="absolute top-0 bottom-0 z-20 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.5)]"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-lg text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: Login Modal (The Logic) ---
const AuthModal = ({ isOpen, onClose, initialRole }) => {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', username: '', role: initialRole });

  // Update role if prop changes
  useEffect(() => { setForm(f => ({ ...f, role: initialRole })); }, [initialRole]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      // LOGIN LOGIC
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (error) {
        alert("Login Error: " + error.message);
      } else {
        // Redirect based on role in profile
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
        if (profile?.role === 'AUTHORITY') router.push('/authority');
        else router.push('/helper');
      }
    } else {
      // SIGN UP LOGIC
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

      if (error) {
        alert("Signup Error: " + error.message);
      } else {
        if (data?.user) {
          // Create Profile
          await supabase.from('profiles').insert([{ id: data.user.id, username: form.username, role: form.role }]);
          alert("Account created! Logging you in...");
          // Auto login redirect
          if (form.role === 'AUTHORITY') router.push('/authority');
          else router.push('/helper');
        }
      }
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-full max-w-md bg-white dark:bg-[#152622] rounded-3xl p-8 shadow-2xl border border-white/10"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>

        <h2 className="text-2xl font-bold mb-2 text-[#0f1a17] dark:text-white">
          {isLogin ? `Login as ${form.role === 'HELPER' ? 'Helper' : 'Authority'}` : "Create Account"}
        </h2>
        <p className="text-sm text-gray-500 mb-6">Enter your details to continue.</p>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <input type="text" placeholder="Username" className="w-full p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-black dark:text-white"
              onChange={e => setForm({ ...form, username: e.target.value })} required />
          )}

          <input type="email" placeholder="Email Address" className="w-full p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-black dark:text-white"
            onChange={e => setForm({ ...form, email: e.target.value })} required />

          <input type="password" placeholder="Password" className="w-full p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-black dark:text-white"
            onChange={e => setForm({ ...form, password: e.target.value })} required />

          <button disabled={loading} className="w-full py-3 rounded-xl bg-primary hover:bg-[#1eb08d] text-white font-bold transition-all shadow-lg shadow-primary/30">
            {loading ? 'Processing...' : (isLogin ? 'Access Dashboard' : 'Join EcoSnap')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          {isLogin ? "New here? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-bold hover:underline">
            {isLogin ? "Create Account" : "Login"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function LandingPage() {
  const [showAuth, setShowAuth] = useState(false);
  const [selectedRole, setSelectedRole] = useState('HELPER');

  const openAuth = (role) => {
    setSelectedRole(role);
    setShowAuth(true);
  };

  return (
    <div className="bg-[#f6f8f7] dark:bg-[#12201d] text-[#0f1a17] dark:text-white transition-colors duration-300 min-h-screen font-sans">

      {/* 1. Header / Navbar */}
      <header className="fixed top-0 z-50 w-full backdrop-blur-md bg-[#f6f8f7]/80 dark:bg-[#12201d]/80 border-b border-[#e8f2f0] dark:border-[#1e332f] px-6 lg:px-20 py-4 transition-all">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/30">
              <span className="font-bold text-xl">🌿</span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">EcoSnap</h2>
          </div>

          <nav className="hidden md:flex items-center gap-10">
            <a href="#mission" className="text-sm font-semibold hover:text-primary transition-colors">Mission</a>
            <a href="#visualize" className="text-sm font-semibold hover:text-primary transition-colors">Visualize</a>
            <a href="#roles" className="text-sm font-semibold hover:text-primary transition-colors">Join Us</a>
          </nav>

          <div className="flex items-center gap-4">
            <button onClick={() => openAuth('HELPER')} className="hidden sm:flex h-11 items-center justify-center rounded-xl bg-[#0f1a17] dark:bg-white px-6 text-sm font-bold text-white dark:text-[#0f1a17] hover:bg-opacity-90 transition-all">
              Login
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">

        {/* 2. Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center px-6 lg:px-20 overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            {/* Replace with your 'hero-bg.jpg' */}
            <img src="/hero-bg.jpg" alt="Nature Background" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50"></div> {/* Dark Overlay */}
          </div>

          <div className="relative z-10 max-w-[1000px] text-center mx-auto text-white space-y-8 mt-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
              className="inline-block rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-6 py-2 text-sm font-medium tracking-wide"
            >
              ✨ Reclaiming Our Urban Spaces
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-black leading-tight tracking-tight drop-shadow-2xl"
            >
              Waste doesn't just disappear.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-200">
                It's changing our world.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }}
              className="mx-auto max-w-2xl text-lg text-gray-200 leading-relaxed font-light"
            >
              Every piece of litter affects our ecosystem. Urban pollution isn't just an eyesore—it's a threat to local biodiversity and community health. But the story doesn't have to end here.
            </motion.p>
          </div>
        </section>

        {/* 3. Visualization Section (Slider) */}
        <section id="visualize" className="py-20 bg-white dark:bg-[#0c1614] border-b border-gray-100 dark:border-white/5 scroll-mt-20">
          <div className="mx-auto max-w-[1280px] px-6 lg:px-20">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold mb-4">Visualize the Transformation</h2>
              <p className="text-slate-600 dark:text-slate-400">Drag the slider to restore the city.</p>
            </div>

            {/* The Custom Slider Component */}
            <ImageComparisonSlider />

            <div className="mt-8 text-center">
              <p className="text-sm italic text-slate-500">"A single action can ripple into a wave of change."</p>
            </div>
          </div>
        </section>

        {/* 4. Mission Section */}
        <section id="mission" className="px-6 py-24 lg:px-20 bg-[#eef5f3] dark:bg-[#1a2e29]">
          <div className="mx-auto max-w-[1000px] text-center">
            <span className="text-primary font-bold tracking-wider uppercase text-sm mb-4 block">Our Mission</span>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-8 leading-tight">
              Bridging the gap between <br className="hidden md:block" /> citizens and action.
            </h2>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-12">
              We believe that everyone has a role to play in preserving our environment. EcoSnap empowers individuals to become guardians of their neighborhoods by providing a direct line to the authorities responsible for maintenance.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mt-16">
              {[
                { icon: 'visibility', title: 'Identify', desc: 'Spot environmental hazards in your daily commute.' },
                { icon: 'connect_without_contact', title: 'Connect', desc: 'Instantly relay precise data to local cleaning teams.' },
                { icon: 'published_with_changes', title: 'Transform', desc: 'Watch as your report leads to tangible, visible change.' }
              ].map((item, i) => (
                <div key={i} className="p-6 bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-slate-100 dark:border-white/10 hover:-translate-y-1 transition-transform duration-300">
                  <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                    <span className="text-primary">{item.title}</span>
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Choose Path Section (Login Entry Points) */}
        <section id="roles" className="px-6 py-24 lg:px-20 bg-background-light dark:bg-background-dark">
          <div className="mx-auto max-w-[1280px]">
            <div className="mb-16 text-center">
              <h2 className="text-4xl font-extrabold tracking-tight mb-4">Choose Your Path</h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Whether you're reporting issues on the ground or managing resources from the office, EcoSnap provides the tools you need.
              </p>
            </div>

            <div className="grid gap-10 lg:grid-cols-2 max-w-5xl mx-auto">
              {/* Helper Card */}
              <div className="group relative overflow-hidden rounded-3xl bg-white dark:bg-[#152622] p-10 shadow-xl border border-slate-100 dark:border-slate-800 hover:shadow-2xl transition-all duration-300 hover:border-primary/30">
                <div className="relative z-10 flex flex-col h-full">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eef5f3] dark:bg-white/5 text-primary mb-6 group-hover:scale-110 transition-transform">
                    <span className="text-4xl">📸</span>
                  </div>
                  <h3 className="text-3xl font-bold mb-2">I am a Helper</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-8 text-lg">Report waste, track your impact, and earn community recognition.</p>
                  <div className="mt-auto pt-6 border-t border-slate-100 dark:border-white/5">
                    <button onClick={() => openAuth('HELPER')} className="w-full py-4 px-6 rounded-xl bg-primary text-[#0f1a17] font-bold text-lg hover:bg-[#1eb08d] transition-colors flex items-center justify-center gap-2">
                      Start as Helper →
                    </button>
                  </div>
                </div>
              </div>

              {/* Authority Card */}
              <div className="group relative overflow-hidden rounded-3xl bg-white dark:bg-[#152622] p-10 shadow-xl border border-slate-100 dark:border-slate-800 hover:shadow-2xl transition-all duration-300 hover:border-blue-500/50">
                <div className="relative z-10 flex flex-col h-full">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eef5f3] dark:bg-white/5 text-blue-500 mb-6 group-hover:scale-110 transition-transform">
                    <span className="text-4xl">🛡️</span>
                  </div>
                  <h3 className="text-3xl font-bold mb-2">I am an Authority</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-8 text-lg">Manage reports, dispatch teams, and analyze city cleanliness data.</p>
                  <div className="mt-auto pt-6 border-t border-slate-100 dark:border-white/5">
                    <button onClick={() => openAuth('AUTHORITY')} className="w-full py-4 px-6 rounded-xl bg-[#0f1a17] dark:bg-white text-white dark:text-[#0f1a17] font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                      Authority Login →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-[#12201d] text-white px-6 py-16 lg:px-20 border-t border-white/5">
        <div className="mx-auto max-w-[1280px] text-center md:text-left">
          <div className="flex items-center gap-3 mb-6 justify-center md:justify-start">
            <span className="text-primary text-2xl">🌿</span>
            <h2 className="text-2xl font-black">EcoSnap</h2>
          </div>
          <p className="text-slate-400 text-sm">© 2024 EcoSnap Technologies Inc. Restoring nature, one snap at a time.</p>
        </div>
      </footer>

      {/* Login Popup */}
      <AnimatePresence>
        {showAuth && <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} initialRole={selectedRole} />}
      </AnimatePresence>

    </div>
  );
}