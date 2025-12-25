"use client";
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { motion } from 'framer-motion';

export default function AuthorityPage() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    const { data } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
    setReports(data || []);
  };

  const resolveReport = async (reportId, authorId) => {
    // 1. Update Report Status
    await supabase.from('reports').update({ status: 'RESOLVED' }).eq('id', reportId);

    // 2. Give Points to Helper
    const { data: user } = await supabase.from('profiles').select('points').eq('id', authorId).single();
    if (user) {
      const newPoints = user.points + 20; // +20 for resolution
      const newLevel = Math.floor(newPoints / 100) + 1;
      
      await supabase.from('profiles').update({ points: newPoints, level: newLevel }).eq('id', authorId);
    }

    alert("Report Resolved! Points awarded to helper.");
    fetchReports(); // Refresh list
  };

  return (
    <div className="min-h-screen p-6 text-white">
      <header className="glass p-4 rounded-xl mb-8">
        <h1 className="text-2xl font-bold">🛡️ Authority Dashboard</h1>
      </header>

      <div className="space-y-4">
        {reports.map((report) => (
          <motion.div 
            key={report.id} 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="glass p-4 rounded-xl flex justify-between items-center"
          >
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">{report.description}</h3>
                <span className={`text-xs px-2 py-1 rounded ${report.status === 'RESOLVED' ? 'bg-green-500' : 'bg-yellow-500'}`}>
                  {report.status}
                </span>
              </div>
              <p className="text-sm opacity-80">📍 {report.location} | Reported by: {report.author_name}</p>
            </div>

            {report.status !== 'RESOLVED' && (
              <button 
                onClick={() => resolveReport(report.id, report.author_id)}
                className="btn-glass px-4 py-2 rounded text-green-300 font-bold hover:bg-green-500 hover:text-white"
              >
                Resolve
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}