"use client";
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '../../hooks/useAuth';
import Layout from '../../components/Layout';
import LoadingSkeleton from '../../components/LoadingSkeleton';

import dynamic from 'next/dynamic';

// This disables SSR for the Map so it doesn't crash
const Map = dynamic(() => import('../../components/Map'), {
  ssr: false,
  loading: () => <p>Loading Map...</p>
});

export default function AuthorityPage() {
  const { user, loading } = useAuth('AUTHORITY');
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const { data } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });
      setReports(data || []);
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoadingReports(false);
    }
  };

  const resolveReport = async (reportId, authorId) => {
    try {
      // 1. Update Report Status
      await supabase.from('reports').update({ status: 'RESOLVED' }).eq('id', reportId);

      // 2. Give Points to Helper
      const { data: helperUser } = await supabase
        .from('profiles')
        .select('points')
        .eq('id', authorId)
        .single();

      if (helperUser) {
        const newPoints = helperUser.points + 20; // +20 for resolution
        const newLevel = Math.floor(newPoints / 100) + 1;

        await supabase
          .from('profiles')
          .update({ points: newPoints, level: newLevel })
          .eq('id', authorId);
      }

      toast.success('✅ Report Resolved! Points awarded to helper.');
      fetchReports(); // Refresh list
    } catch (error) {
      toast.error('Failed to resolve report');
    }
  };

  if (loading) return (
    <div className="min-h-screen p-6">
      <LoadingSkeleton count={3} />
    </div>
  );

  if (!user) return null;

  return (
    <Layout user={user} title="🛡️ Authority Dashboard">
      {loadingReports ? (
        <LoadingSkeleton count={5} height="h-20" />
      ) : (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="glass p-8 rounded-xl text-center opacity-70">
              <p>No reports yet. The community is doing great! 🌿</p>
            </div>
          ) : (
            reports.map((report) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-4 rounded-xl flex justify-between items-center"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{report.description}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded ${report.status === 'RESOLVED'
                        ? 'bg-green-500 text-white'
                        : 'bg-yellow-500 text-black'
                        }`}
                    >
                      {report.status}
                    </span>
                  </div>
                  <p className="text-sm opacity-80">
                    📍 {report.location} | Reported by: {report.author_name}
                  </p>
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
            ))
          )}
        </div>
      )}
    </Layout>
  );
}