
import { supabase } from './supabase';
import { User, CreditPlan } from '../types';

const PLANS_KEY = 'genesis_kids_plans';

const DEFAULT_PLANS: CreditPlan[] = [
  { id: 'starter', name: 'Pack Iniciante', credits: 10, price: 'R$ 9,90', icon: 'zap', color: 'blue' },
  { id: 'popular', name: 'Pack Família', credits: 50, price: 'R$ 39,90', icon: 'star', color: 'amber', popular: true },
  { id: 'master', name: 'Pack Igreja', credits: 150, price: 'R$ 89,90', icon: 'shield', color: 'emerald' },
];

export const authService = {
  getPlans: (): CreditPlan[] => {
    const data = localStorage.getItem(PLANS_KEY);
    if (!data) {
      localStorage.setItem(PLANS_KEY, JSON.stringify(DEFAULT_PLANS));
      return DEFAULT_PLANS;
    }
    return JSON.parse(data);
  },

  savePlans: (plans: CreditPlan[]) => {
    localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
  },

  signup: async (name: string, email: string, password: string): Promise<User> => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Falha ao criar usuário.');

    // Profile creation is handled by Supabase trigger
    // Wait a bit for the trigger to finish or fetch immediately
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) throw profileError;

    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      credits: profile.credits,
      createdAt: new Date(profile.created_at).getTime()
    };
  },

  login: async (email: string, password: string): Promise<User> => {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Usuário não encontrado.');

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) throw profileError;

    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      credits: profile.credits,
      createdAt: new Date(profile.created_at).getTime()
    };
  },

  updateUser: async (updatedUser: User) => {
    const { error } = await supabase
      .from('profiles')
      .update({
        name: updatedUser.name,
        role: updatedUser.role,
        credits: updatedUser.credits
      })
      .eq('id', updatedUser.id);

    if (error) throw error;
  },

  deleteUser: async (userId: string) => {
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) throw error;
  },

  updateUserRole: async (userId: string, newRole: 'admin' | 'user') => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) throw error;
  },

  getSession: async (): Promise<User | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error || !profile) return null;

    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      credits: profile.credits,
      createdAt: new Date(profile.created_at).getTime()
    };
  },

  logout: async () => {
    await supabase.auth.signOut();
  }
};
