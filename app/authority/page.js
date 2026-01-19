"use client";
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '../utils/supabaseClient';
import { useRouter } from 'next/navigation';
import ThemeToggle from '../../components/ThemeToggle';
import { POINTS, STATUS } from '../utils/constants';

export default function AuthorityDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);
  const [filter, setFilter] = useState('ALL');

  // Fetch user and reports on mount
  useEffect(() => {
    const init = async () => {
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

        if (profile?.role !== 'AUTHORITY') {
          router.push('/helper');
          return;
        }

        setUser(profile);
        await fetchReports();
      } catch (error) {
        toast.error('Failed to load dashboard');
        router.push('/');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load reports');
    } else {
      setReports(data || []);
    }
  };

  const resolveReport = async (reportId, authorId) => {
    setResolvingId(reportId);
    try {
      // Update report status
      const { error: updateError } = await supabase
        .from('reports')
        .update({ status: 'RESOLVED' })
        .eq('id', reportId);

      if (updateError) throw updateError;

      // Award points to helper
      const { data: profile } = await supabase
        .from('profiles')
        .select('points, level')
        .eq('id', authorId)
        .single();

      if (profile) {
        const newPoints = (profile.points || 0) + POINTS.REPORT_RESOLVED;
        const newLevel = Math.floor(newPoints / 100) + 1;

        await supabase
          .from('profiles')
          .update({ points: newPoints, level: newLevel })
          .eq('id', authorId);
      }

      toast.success('Report resolved! Helper awarded +20 XP');
      await fetchReports();
    } catch (error) {
      toast.error('Failed to resolve report: ' + error.message);
    } finally {
      setResolvingId(null);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Logout failed');
    } else {
      toast.success('Logged out successfully');
      router.push('/');
    }
  };

  // Stats
  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'PENDING').length,
    resolved: reports.filter(r => r.status === 'RESOLVED').length,
  };

  // Filtered reports
  const filteredReports = filter === 'ALL'
    ? reports
    : reports.filter(r => r.status === filter);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-blue-600 dark:text-blue-400 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-gray-800 dark:text-gray-100 p-4 md:p-6 lg:p-8 transition-colors"
    >
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl px-6 py-4 flex flex-col md:flex-row justify-between items-center shadow-sm border border-slate-100 dark:border-zinc-800"
        >
          <div className="flex items-center space-x-3 mb-3 md:mb-0">
            <div className="bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-xl p-2.5 text-white shadow-lg shadow-blue-500/20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Authority Dashboard</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage community reports</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <div className="hidden md:flex items-center space-x-3 bg-slate-50 dark:bg-zinc-800 rounded-full py-2 px-4 border border-slate-100 dark:border-zinc-700">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{user.username}</span>
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors border border-red-100 dark:border-red-800/50"
            >
              Logout
            </motion.button>
          </div>
        </motion.header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Total Reports', value: stats.total, color: 'blue', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
            { label: 'Pending', value: stats.pending, color: 'amber', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
            { label: 'Resolved', value: stats.resolved, color: 'emerald', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-slate-100 dark:border-zinc-800 shadow-sm`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                  <p className={`text-3xl font-bold ${stat.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                      stat.color === 'amber' ? 'text-amber-600 dark:text-amber-400' :
                        'text-emerald-600 dark:text-emerald-400'
                    }`}>{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20' :
                    stat.color === 'amber' ? 'bg-amber-50 dark:bg-amber-900/20' :
                      'bg-emerald-50 dark:bg-emerald-900/20'
                  }`}>
                  <svg className={`w-6 h-6 ${stat.color === 'blue' ? 'text-blue-500' :
                      stat.color === 'amber' ? 'text-amber-500' :
                        'text-emerald-500'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 bg-white dark:bg-zinc-900 p-1.5 rounded-xl w-fit border border-slate-100 dark:border-zinc-800">
          {['ALL', 'PENDING', 'RESOLVED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === status
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-zinc-800'
                }`}
            >
              {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredReports.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-zinc-900 rounded-2xl p-12 text-center border border-slate-100 dark:border-zinc-800"
              >
                <div className="w-16 h-16 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No reports found</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {filter === 'PENDING' ? 'All reports have been resolved!' : 'No reports have been submitted yet.'}
                </p>
              </motion.div>
            ) : (
              filteredReports.map((report, index) => (
                <motion.div
                  key={report.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    {report.image_url && (
                      <div className="md:w-48 h-48 md:h-auto flex-shrink-0">
                        <img
                          src={report.image_url}
                          alt="Report"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${report.status === 'RESOLVED'
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                              }`}>
                              {report.status}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(report.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-900 dark:text-white font-medium mb-2">{report.description}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <span className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{report.location}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>{report.author_name}</span>
                        </span>
                      </div>

                      {report.status === 'PENDING' && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => resolveReport(report.id, report.author_id)}
                          disabled={resolvingId === report.id}
                          className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl font-medium text-sm shadow-sm shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          {resolvingId === report.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Resolving...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Mark Resolved</span>
                            </>
                          )}
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

      </div>
    </motion.div>
  );
}
