import { supabase } from './supabaseClient';
import { User, Session } from '@supabase/supabase-js';

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function signUpWithEmail(email: string, password: string): Promise<{ user: User | null; error: Error | null }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) return { user: null, error };
  return { user: data.user, error: null };
}

export async function signInWithEmail(email: string, password: string): Promise<{ user: User | null; error: Error | null }> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) return { user: null, error };
  return { user: data.user, error: null };
}

export async function signOutUser(): Promise<{ error: Error | null }> {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function resetPasswordForEmail(email: string): Promise<{ error: Error | null }> {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  return { error };
}

export function subscribeToAuthChanges(callback: (user: User | null, session: Session | null) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null, session);
  });
  return subscription;
}
