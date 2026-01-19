import { supabase } from '../utils/supabaseClient';
import { STATUS } from '../utils/constants';

export const reportService = {
    /**
     * Fetch all reports ordered by creation date
     */
    async getAll() {
        const { data, error } = await supabase
            .from('reports')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    /**
     * Create a new report
     */
    async create(report) {
        const { data, error } = await supabase
            .from('reports')
            .insert([report])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Mark a report as resolved
     */
    async resolve(reportId) {
        const { error } = await supabase
            .from('reports')
            .update({ status: STATUS.RESOLVED })
            .eq('id', reportId);

        if (error) throw error;
    },

    /**
     * Upload image to Supabase Storage
     */
    async uploadImage(file, userId) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;

        const { data, error } = await supabase.storage
            .from('report-images')
            .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from('report-images')
            .getPublicUrl(fileName);

        return publicUrl;
    },
};

export const profileService = {
    /**
     * Get user profile by ID
     */
    async getById(userId) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Award points to a user
     */
    async awardPoints(userId, points) {
        const { data: profile } = await this.getById(userId);

        if (!profile) throw new Error('User not found');

        const newPoints = profile.points + points;
        const newLevel = Math.floor(newPoints / 100) + 1;

        const { error } = await supabase
            .from('profiles')
            .update({ points: newPoints, level: newLevel })
            .eq('id', userId);

        if (error) throw error;

        return { newPoints, newLevel };
    },

    /**
     * Create a new profile
     */
    async create(userId, username, role) {
        const { error } = await supabase
            .from('profiles')
            .insert([{ id: userId, username, role }]);

        if (error) throw error;
    },
};
