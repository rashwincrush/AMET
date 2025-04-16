import { supabase } from '@/lib/supabase';
import { handleError } from './errorHandler';
import { UserProfile, Achievement } from './apiTypes';

// Fetch all records from a specific table
export const fetchRecords = async <T>(table: string): Promise<T[] | undefined> => {
  try {
    const { data, error } = await supabase.from<T>(table).select('*');
    if (error) throw error;
    return data as T[];
  } catch (error) {
    handleError(error);
    return undefined;
  }
};

// Insert a new record into a specific table
export const insertRecord = async <T>(table: string, record: T): Promise<T | undefined> => {
  try {
    const { data, error } = await supabase.from<T>(table).insert([record]);
    if (error) throw error;
    return data[0] as T;
  } catch (error) {
    handleError(error);
    return undefined;
  }
};

// Update a record in a specific table
export const updateRecord = async <T>(table: string, id: string, updates: Partial<T>): Promise<T | undefined> => {
  try {
    const { data, error } = await supabase.from<T>(table).update(updates).eq('id', id);
    if (error) throw error;
    return data[0] as T;
  } catch (error) {
    handleError(error);
    return undefined;
  }
};

// Delete a record from a specific table
export const deleteRecord = async <T>(table: string, id: string): Promise<T | undefined> => {
  try {
    const { data, error } = await supabase.from<T>(table).delete().eq('id', id);
    if (error) throw error;
    return data[0] as T;
  } catch (error) {
    handleError(error);
    return undefined;
  }
};

// Fetch all user profiles
export const fetchUserProfiles = async (): Promise<UserProfile[] | undefined> => {
  try {
    const { data, error } = await supabase.from<UserProfile>('profiles').select('*');
    if (error) throw error;
    return data as UserProfile[];
  } catch (error) {
    handleError(error);
    return undefined;
  }
};

// Insert a new user profile
export const insertUserProfile = async (profile: UserProfile): Promise<UserProfile | undefined> => {
  try {
    const { data, error } = await supabase.from<UserProfile>('profiles').insert([profile]);
    if (error) throw error;
    return data[0] as UserProfile;
  } catch (error) {
    handleError(error);
    return undefined;
  }
};

// Update a user profile
export const updateUserProfile = async (id: string, updates: Partial<UserProfile>): Promise<UserProfile | undefined> => {
  try {
    const { data, error } = await supabase.from<UserProfile>('profiles').update(updates).eq('id', id);
    if (error) throw error;
    return data[0] as UserProfile;
  } catch (error) {
    handleError(error);
    return undefined;
  }
};

// Delete a user profile
export const deleteUserProfile = async (id: string): Promise<UserProfile | undefined> => {
  try {
    const { data, error } = await supabase.from<UserProfile>('profiles').delete().eq('id', id);
    if (error) throw error;
    return data[0] as UserProfile;
  } catch (error) {
    handleError(error);
    return undefined;
  }
};
