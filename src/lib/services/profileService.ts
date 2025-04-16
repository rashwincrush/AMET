import { supabase } from '@/lib/supabase';
import { Profile, Achievement } from '@/types/database';

export const profileService = {
  // Get profile by ID
  async getProfileById(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Profile;
  },
  
  // Get profile by user ID (auth.id)
  async getProfileByUserId(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data as Profile;
  },
  
  // Create or update profile
  async upsertProfile(profile: Partial<Profile> & { id: string }) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert([profile])
      .select()
      .single();
    
    if (error) throw error;
    return data as Profile;
  },
  
  // Get all profiles
  async getAllProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('last_name', { ascending: true });
    
    if (error) throw error;
    return data as Profile[];
  },
  
  // Search profiles
  async searchProfiles(query: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
      .order('last_name', { ascending: true });
    
    if (error) throw error;
    return data as Profile[];
  },
  
  // Get profile achievements
  async getProfileAchievements(profileId: string) {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('profile_id', profileId)
      .order('year', { ascending: false });
    
    if (error) throw error;
    return data as Achievement[];
  },
  
  // Add achievement
  async addAchievement(achievement: Omit<Achievement, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('achievements')
      .insert([achievement])
      .select()
      .single();
    
    if (error) throw error;
    return data as Achievement;
  },
  
  // Update achievement
  async updateAchievement(id: string, updates: Partial<Achievement>) {
    const { data, error } = await supabase
      .from('achievements')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Achievement;
  },
  
  // Delete achievement
  async deleteAchievement(id: string) {
    const { error } = await supabase
      .from('achievements')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
}; 