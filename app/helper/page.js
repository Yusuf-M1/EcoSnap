"use client";
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '../utils/supabaseClient';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import ThemeToggle from '../../components/ThemeToggle';
import ProfileModal from '../../components/ProfileModal';

// Dynamic Map Import (Prevents SSR Crash)
const ReportMap = dynamic(() => import('../../components/ReportMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-emerald-50 dark:bg-zinc-800 animate-pulse flex items-center justify-center rounded-[1.5rem]">
      <div className="flex flex-col items-center space-y-3">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-emerald-600 dark:text-emerald-400 font-medium">Loading Map...</span>
      </div>
    </div>
  )
});

export default function HelperDashboard() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  // State Management
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [description, setDescription] = useState('');
  const [locationText, setLocationText] = useState('');
  const [coordinates, setCoordinates] = useState({ lat: 51.505, lng: -0.09 });
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [userStats, setUserStats] = useState({ reportsSubmitted: 0 });

  // Fetch User on Mount
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/');
          return;
        }

        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setUser(profile);

        // Get User's Location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              setCoordinates({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            },
            (error) => {
              console.log('Location access denied, using default coordinates');
            }
          );
        }
      } catch (error) {
        toast.error('Failed to load user data');
        router.push('/');
      } finally {
        setInitialLoading(false);
      }
    };
    getUser();
  }, [router]);

  // Fetch user stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      const { count } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', user.id);
      setUserStats({ reportsSubmitted: count || 0 });
    };
    fetchStats();
  }, [user]);

  // Handle Image Selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      // Validate file size (5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  // Remove Image
  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submit Report
  const handleSubmit = async () => {
    // Validation
    if (!file) {
      toast.error("Please upload a photo of the issue");
      return;
    }
    if (!description.trim()) {
      toast.error("Please provide a description");
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Uploading report...');

    try {
      // Upload Image
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('report-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('report-images')
        .getPublicUrl(fileName);

      // Save to Database
      const { error: dbError } = await supabase.from('reports').insert([
        {
          description: description.trim(),
          location: locationText.trim() || `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`,
          latitude: coordinates.lat,
          longitude: coordinates.lng,
          image_url: publicUrl,
          author_id: user.id,
          author_name: user.username,
          status: 'PENDING'
        }
      ]);

      if (dbError) throw dbError;

      // Success
      toast.success('Report submitted successfully! +10 XP 🎉', { id: toastId });

      // Reset Form
      setDescription('');
      setLocationText('');
      setFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.message || 'Failed to submit report', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // Logout Handler
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Logout failed');
    } else {
      toast.success('Logged out successfully');
      router.push('/');
    }
  };

  // Loading State
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#ecfdf5] dark:bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-emerald-600 dark:text-emerald-400 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-4 md:p-6 lg:p-8 transition-colors duration-200 font-sans bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 text-gray-800 dark:text-gray-100"
    >
      <div className="max-w-[1600px] mx-auto space-y-6">

        {/* HEADER */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md rounded-full px-6 py-4 flex flex-col md:flex-row justify-between items-center shadow-sm border border-white/50 dark:border-white/10 sticky top-4 z-40"
        >
          <div className="flex items-center space-x-3 mb-2 md:mb-0">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-tr from-emerald-400 to-green-300 rounded-full p-2 text-white shadow-lg shadow-emerald-200 dark:shadow-none"
            >
              <span className="material-symbols-outlined">recycling</span>
            </motion.div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">
              EcoSnap
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="hidden md:flex flex-col items-end"
            >
              <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">Current Level</span>
              <div className="flex items-center space-x-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Level {user.level || 1}</span>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <span className="text-gray-600 dark:text-gray-400 text-sm">{user.points || 0} XP</span>
              </div>
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowProfile(true)}
              className="flex items-center space-x-3 bg-white dark:bg-zinc-800 rounded-full py-1.5 px-2 pl-4 border border-gray-100 dark:border-zinc-700 shadow-sm cursor-pointer hover:shadow-md transition-all"
            >
              <span className="text-sm font-medium">
                Hello, <span className="text-emerald-600 dark:text-emerald-400">{user.username}</span>
              </span>
              <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                <span className="material-symbols-outlined text-sm">person</span>
              </div>
            </motion.button>
            <ThemeToggle />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="hidden md:flex items-center space-x-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full transition-colors border border-red-200 dark:border-red-800"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              <span className="text-sm font-medium">Logout</span>
            </motion.button>
          </div>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: UPLOAD & FORM */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-8 flex flex-col gap-6"
          >

            {/* UPLOAD AREA */}
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 shadow-sm border border-emerald-50 dark:border-zinc-800 relative overflow-hidden group hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <span className="material-symbols-outlined text-emerald-500">photo_camera</span>
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white">Evidence Upload</h2>
                </div>
                {previewUrl && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleRemoveImage}
                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-full transition-colors"
                    title="Remove image"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </motion.button>
                )}
              </div>

              <motion.div
                whileHover={{ scale: previewUrl ? 1 : 1.02 }}
                onClick={() => fileInputRef.current.click()}
                className="w-full h-64 border-2 border-dashed border-emerald-200 dark:border-zinc-700 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-50/50 dark:hover:bg-zinc-800/50 hover:border-emerald-400 transition-all relative overflow-hidden"
              >
                <AnimatePresence mode="wait">
                  {previewUrl ? (
                    <motion.img
                      key="preview"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-3xl"
                    />
                  ) : (
                    <motion.div
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center"
                    >
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform"
                      >
                        <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-3xl">cloud_upload</span>
                      </motion.div>
                      <span className="text-gray-500 dark:text-gray-400 font-medium">Upload Photo</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </motion.div>
            </motion.div>

            {/* DETAILS & LOCATION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 shadow-sm border border-emerald-50 dark:border-zinc-800 flex flex-col hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <span className="material-symbols-outlined text-emerald-500">description</span>
                  <h2 className="text-lg font-bold">Details</h2>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="flex-grow w-full bg-gray-50 dark:bg-zinc-800/50 text-gray-900 dark:text-gray-100 rounded-2xl p-4 placeholder-gray-400 dark:placeholder-gray-500 border-0 focus:ring-2 focus:ring-emerald-500/50 resize-none transition-all"
                  placeholder="Describe the trash type, size, and any other relevant details..."
                  rows="6"
                ></textarea>
                <div className="mt-2 text-xs text-gray-400 dark:text-gray-500 text-right">
                  {description.length} characters
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 shadow-sm border border-emerald-50 dark:border-zinc-800 flex flex-col hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <span className="material-symbols-outlined text-emerald-500">pin_drop</span>
                  <h2 className="text-lg font-bold">Location Details</h2>
                </div>
                <div className="space-y-4 flex-grow">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 material-symbols-outlined text-sm">search</span>
                    <input
                      value={locationText}
                      onChange={(e) => setLocationText(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-zinc-800/50 text-gray-900 dark:text-gray-100 rounded-2xl pl-12 pr-4 py-3 placeholder-gray-400 dark:placeholder-gray-500 border-0 focus:ring-2 focus:ring-emerald-500/50 transition-all"
                      placeholder="e.g. Central Park (Optional)"
                      type="text"
                    />
                  </div>
                  <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/30"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-sm">location_on</span>
                      <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-200">GPS Coordinates</p>
                    </div>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300 font-mono">
                      {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* SUBMIT BUTTON */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={loading || !file || !description.trim()}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-bold text-lg py-5 rounded-full shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 disabled:shadow-none transition-all duration-300 flex items-center justify-center space-x-2 group"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting Report...</span>
                </>
              ) : (
                <>
                  <span>Submit Report</span>
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="material-symbols-outlined"
                  >
                    send
                  </motion.span>
                </>
              )}
            </motion.button>

          </motion.div>

          {/* RIGHT COLUMN: MAP */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-4 h-full"
          >
            <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-2 h-full min-h-[500px] lg:min-h-[700px] shadow-sm border border-emerald-50 dark:border-zinc-800 flex flex-col relative group hover:shadow-md transition-shadow">
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="absolute top-6 left-6 z-[1000] bg-white/90 dark:bg-zinc-800/90 backdrop-blur px-4 py-2 rounded-full shadow-sm flex items-center space-x-2 pointer-events-none"
              >
                <span className="material-symbols-outlined text-emerald-500">map</span>
                <span className="font-bold text-sm">Pinpoint Location</span>
              </motion.div>

              <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden z-0">
                <ReportMap setCoordinates={setCoordinates} coordinates={coordinates} />
              </div>
            </div>
          </motion.div>

        </div>

        {/* Mobile Logout */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="md:hidden w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full transition-colors border border-red-200 dark:border-red-800"
        >
          <span className="material-symbols-outlined text-sm">logout</span>
          <span className="text-sm font-medium">Logout</span>
        </motion.button>
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        user={user}
        userRole="HELPER"
        stats={userStats}
      />
    </motion.div>
  );
}