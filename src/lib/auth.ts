import { createClient } from '@supabase/supabase-js';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';
import { useState, useEffect } from 'react';

const createClientComponentClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing required Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseAnonKey);
};

export const supabase = createClientComponentClient();

export const createServerSideSupabaseClient = () => {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
};

export async function getSession() {
  const supabase = createServerSideSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session;
}

export async function getUser() {
  const supabase = createServerSideSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return null;

  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getProfile() {
  const supabase = createServerSideSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return null;

  // First try by ID
  const { data: profileById, error: errorById } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .maybeSingle();

  if (profileById) {
    return profileById;
  }

  // If not found by ID, try by email
  if (session.user.email) {
    const { data: profileByEmail, error: errorByEmail } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', session.user.email)
      .maybeSingle();

    if (profileByEmail) {
      return profileByEmail;
    }
  }

  // No profile found
  console.log('No profile found for user');
  return null;
}

export async function redirectToLogin() {
  redirect('/auth/login');
}

export async function redirectToProfile() {
  redirect('/profile');
}

export async function checkAuth() {
  const session = await getSession();
  if (!session) {
    await redirectToLogin();
  }
  return session;
}

export async function checkProfile() {
  const profile = await getProfile();
  if (!profile) {
    await redirectToProfile();
  }
  return profile;
}

export function useAuth() {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return { user, signOut: () => supabase.auth.signOut() };
}

export async function signOut() {
  const supabase = createServerSideSupabaseClient();
  await supabase.auth.signOut();
  redirect('/login');
}
