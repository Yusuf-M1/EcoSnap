"use client";
import { useState } from 'react';
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

export default function HelperPage() {
  const { user, loading } = useAuth('HELPER');
  const [report, setReport] = useState({ description: '', location: '', imageUrl: '' });
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitReport = async (e) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from('reports').insert([
        {
          description: report.description,
          location: report.location,
          author_id: user.id,
          author_name: user.username
        }
      ]);

      if (error) throw error;

      toast.success('🎉 Report Submitted! +10 Points Pending Verification.');
      setReport({ description: '', location: '', imageUrl: '' });
      setImagePreview(null);
    } catch (error) {
      toast.error('Failed to submit report: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen p-6">
      <LoadingSkeleton count={3} />
    </div>
  );

  if (!user) return null;

  return (
    <Layout user={user} title="🌿 Report Trash">
      <div className="grid md:grid-cols-2 gap-8">
        <motion.div initial={{ x: -50 }} animate={{ x: 0 }} className="glass p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-4">📸 Submit Report</h2>
          <form onSubmit={submitReport} className="space-y-4">
            <div className="border-2 border-dashed border-white/30 rounded-lg h-32 flex items-center justify-center cursor-pointer hover:bg-white/10 transition relative overflow-hidden">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <p>Upload Photo (Demo)</p>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            <textarea
              placeholder="Description & Tag Authority (@CityCouncil)..."
              className="w-full p-3 rounded bg-white/20 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-green-400"
              value={report.description}
              onChange={e => setReport({ ...report, description: e.target.value })}
              required
            />

            <input
              placeholder="Location Details"
              className="w-full p-3 rounded bg-white/20 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-green-400"
              value={report.location}
              onChange={e => setReport({ ...report, location: e.target.value })}
              required
            />

            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-glass py-3 rounded font-bold text-green-300 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </form>
        </motion.div>

        {/* Map Section */}
        <div className="glass p-6 rounded-xl flex flex-col h-[400px]">
          <h2 className="text-xl font-bold mb-4">📍 Location Preview</h2>

          {/* The Map Container */}
          <div className="flex-1 rounded-lg overflow-hidden border border-white/30 relative z-0">
            <Map />
          </div>
        </div>
      </div>
    </Layout>
  );
}