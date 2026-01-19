"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '../app/utils/supabaseClient';
import { getLevelFromXP, getLevelProgress, getXPToNextLevel } from '../app/utils/constants';

export default function ProfileModal({ isOpen, onClose, user, userRole, stats }) {
    const [bio, setBio] = useState(user?.bio || '');
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user?.bio) {
            setBio(user.bio);
        }
    }, [user]);

    const handleSaveBio = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ bio: bio.trim() })
                .eq('id', user.id);

            if (error) throw error;

            toast.success('Bio updated successfully!');
            setIsEditing(false);
        } catch (error) {
            toast.error('Failed to save bio: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    const isHelper = userRole === 'HELPER';

    // Get level info using the new system
    const levelInfo = getLevelFromXP(user?.points);
    const levelProgress = getLevelProgress(user?.points);
    const xpToNext = getXPToNextLevel(user?.points);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
                >
                    {/* Header */}
                    <div className={`p-6 ${isHelper ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white text-2xl font-bold">
                                    {user?.username?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">{user?.username}</h2>
                                    {isHelper ? (
                                        <span className="px-3 py-1 bg-white/20 rounded-full text-white text-xs font-medium">
                                            ✨ {levelInfo.title}
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 bg-white/20 rounded-full text-white text-xs font-medium">
                                            🛡️ Authority
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            {isHelper ? (
                                <>
                                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 text-center">
                                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{levelInfo.level}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Level</p>
                                    </div>
                                    <div className="bg-teal-50 dark:bg-teal-900/20 rounded-2xl p-4 text-center">
                                        <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">{user?.points || 0}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Total XP</p>
                                    </div>
                                    <div className="col-span-2 bg-gray-50 dark:bg-zinc-800 rounded-2xl p-4 text-center">
                                        <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{stats?.reportsSubmitted || 0}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Reports Submitted</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 text-center">
                                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats?.reportsResolved || 0}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Resolved</p>
                                    </div>
                                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-4 text-center">
                                        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats?.totalReports || 0}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Total Reports</p>
                                    </div>
                                    <div className="col-span-2 bg-gray-50 dark:bg-zinc-800 rounded-2xl p-4 text-center">
                                        <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{stats?.uniqueHelpers || 0}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Helpers Supported</p>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* XP Progress for Helpers */}
                        {isHelper && (
                            <div className="mt-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-800/30">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Current Title</span>
                                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">✨ {levelInfo.title}</p>
                                    </div>
                                    {levelInfo.level < 10 && (
                                        <div className="text-right">
                                            <span className="text-xs text-gray-500 dark:text-gray-400">Next Level</span>
                                            <p className="text-sm font-medium text-teal-600 dark:text-teal-400">{xpToNext} XP needed</p>
                                        </div>
                                    )}
                                </div>
                                <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${levelProgress}%` }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                                    />
                                </div>
                                <div className="flex justify-between mt-2">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Level {levelInfo.level}</span>
                                    {levelInfo.level < 10 && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Level {levelInfo.level + 1}</span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Bio Section */}
                        <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">About Me</h3>
                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="text-xs text-blue-500 hover:underline"
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>

                            {isEditing ? (
                                <div className="space-y-3">
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder="Tell us about yourself..."
                                        className="w-full p-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
                                        rows={3}
                                        maxLength={200}
                                    />
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-400">{bio.length}/200</span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    setBio(user?.bio || '');
                                                }}
                                                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSaveBio}
                                                disabled={saving}
                                                className={`px-4 py-2 text-sm text-white rounded-lg transition-colors ${isHelper
                                                        ? 'bg-emerald-500 hover:bg-emerald-600'
                                                        : 'bg-blue-500 hover:bg-blue-600'
                                                    } disabled:opacity-50`}
                                            >
                                                {saving ? 'Saving...' : 'Save'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {bio || "No bio yet. Click 'Edit' to add one!"}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
