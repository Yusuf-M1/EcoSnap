"use client";
import { motion } from 'framer-motion';

export default function Layout({ children, user, title }) {
    return (
        <div className="min-h-screen p-6 text-white">
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="glass p-4 rounded-xl mb-8 flex justify-between items-center"
            >
                <h1 className="text-2xl font-bold">{title}</h1>
                {user && (
                    <div className="text-right">
                        <p className="text-sm opacity-80">Hello, {user.username}</p>
                        <div className="flex items-center gap-3 mt-1">
                            <p className="text-xl font-bold text-green-300">{user.points} XP</p>
                            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                                Level {user.level}
                            </span>
                        </div>
                    </div>
                )}
            </motion.header>
            {children}
        </div>
    );
}
