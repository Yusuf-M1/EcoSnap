// Application Constants

export const POINTS = {
    REPORT_SUBMITTED: 10,
    REPORT_RESOLVED: 20,    // Bonus when report is accepted
    REPORT_REJECTED: -10,   // Penalty when report is false
};

export const ROLES = {
    HELPER: 'HELPER',
    AUTHORITY: 'AUTHORITY',
};

export const STATUS = {
    PENDING: 'PENDING',
    RESOLVED: 'RESOLVED',
    REJECTED: 'REJECTED',
};

// Level System - Each level requires 25% more XP than previous
// Base: 100 XP for Level 1 -> Level 2
export const LEVELS = [
    { level: 1, title: 'Eco Seedling', minXP: 0, maxXP: 100 },
    { level: 2, title: 'Green Sprout', minXP: 100, maxXP: 225 },       // +125 (100 * 1.25)
    { level: 3, title: 'Nature Guardian', minXP: 225, maxXP: 381 },    // +156 (125 * 1.25)
    { level: 4, title: 'Earth Protector', minXP: 381, maxXP: 576 },    // +195 (156 * 1.25)
    { level: 5, title: 'Eco Warrior', minXP: 576, maxXP: 820 },        // +244 (195 * 1.25)
    { level: 6, title: 'Planet Defender', minXP: 820, maxXP: 1125 },   // +305 (244 * 1.25)
    { level: 7, title: 'Environment Hero', minXP: 1125, maxXP: 1506 }, // +381 (305 * 1.25)
    { level: 8, title: 'Eco Champion', minXP: 1506, maxXP: 1983 },     // +477 (381 * 1.25)
    { level: 9, title: 'Earth Legend', minXP: 1983, maxXP: 2579 },     // +596 (477 * 1.25)
    { level: 10, title: 'Eco Master', minXP: 2579, maxXP: Infinity },  // Max level
];

// Helper function to get level info from XP
export const getLevelFromXP = (xp) => {
    const points = xp || 0;
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (points >= LEVELS[i].minXP) {
            return LEVELS[i];
        }
    }
    return LEVELS[0];
};

// Helper function to get progress to next level (0-100%)
export const getLevelProgress = (xp) => {
    const points = xp || 0;
    const currentLevel = getLevelFromXP(points);
    if (currentLevel.level === 10) return 100; // Max level

    const xpInCurrentLevel = points - currentLevel.minXP;
    const xpNeededForNextLevel = currentLevel.maxXP - currentLevel.minXP;
    return Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100);
};

// Helper function to get XP needed for next level
export const getXPToNextLevel = (xp) => {
    const points = xp || 0;
    const currentLevel = getLevelFromXP(points);
    if (currentLevel.level === 10) return 0; // Max level
    return currentLevel.maxXP - points;
};

export const MESSAGES = {
    REPORT_SUCCESS: '🎉 Report Submitted! +10 XP earned.',
    REPORT_RESOLVED: '✅ Report Verified! +20 XP bonus awarded.',
    REPORT_REJECTED: '⚠️ Report marked as false. -10 XP.',
    VERIFICATION_SENT: '📧 Verification email sent! Check your inbox.',
    WELCOME_BACK: 'Welcome back! 🌿',
    LOGIN_ERROR: 'Login failed. Please check your credentials.',
    SIGNUP_ERROR: 'Signup failed. Please try again.',
};

