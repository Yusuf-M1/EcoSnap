"use client";
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function HelperPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [report, setReport] = useState({ description: '', location: '', imageUrl: '' });

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push('/');
      
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setUser(profile);
    };
    getUser();
  }, []);

  const submitReport = async (e) => {
    e.preventDefault();
    if (!user) return;

    const { error } = await supabase.from('reports').insert([
      {
        description: report.description,
        location: report.location,
        author_id: user.id,
        author_name: user.username
      }
    ]);

    if (error) alert('Error submitting report');
    else {
      alert('Report Submitted! +10 Points Pending Verification.');
      setReport({ description: '', location: '', imageUrl: '' });
    }
  };

  if (!user) return <div className="text-white text-center mt-20">Loading...</div>;

  return (
    <div className="min-h-screen p-6 text-white">
      <header className="flex justify-between items-center glass p-4 rounded-xl mb-8">
        <h1 className="text-2xl font-bold">🌿 Hello, {user.username}</h1>
        <div className="text-right">
          <p className="text-xl font-bold text-green-300">{user.points} XP</p>
          <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Level {user.level}</span>
        </div>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        <motion.div initial={{ x: -50 }} animate={{ x: 0 }} className="glass p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-4">📸 Report Trash</h2>
          <form onSubmit={submitReport} className="space-y-4">
            <div className="border-2 border-dashed border-white/30 rounded-lg h-32 flex items-center justify-center cursor-pointer hover:bg-white/10">
              <p>Upload Photo (Demo)</p>
            </div>
            
            <textarea placeholder="Description & Tag Authority (@CityCouncil)..." 
              className="w-full p-3 rounded bg-white/20 placeholder-white/70 focus:outline-none"
              value={report.description}
              onChange={e => setReport({...report, description: e.target.value})}
            />
            
            <input placeholder="Location Details" 
              className="w-full p-3 rounded bg-white/20 placeholder-white/70 focus:outline-none"
              value={report.location}
              onChange={e => setReport({...report, location: e.target.value})}
            />
            
            <button className="w-full btn-glass py-3 rounded font-bold text-green-300">Submit Report</button>
          </form>
        </motion.div>

        <div className="glass p-6 rounded-xl flex items-center justify-center">
          <p className="opacity-70">Interactive Map View</p>
          {/* Your <Map /> component goes here */}
        </div>
      </div>
    </div>
  );
}