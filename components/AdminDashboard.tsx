
import React, { useState, useEffect } from 'react';
import {
  Users, ShieldCheck, Trash2, Search, BarChart3,
  Settings, RefreshCw, UserCog, Mail, Calendar, Info,
  Edit3, X, Save, Coins, ArrowUpCircle, ArrowDownCircle, Filter,
  ShoppingBag, Plus, Star, Zap, Shield
} from 'lucide-react';
import { User, CreditPlan } from '../types';
import { authService } from '../services/authService';
import { supabase } from '../services/supabase';

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<CreditPlan[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'plans' | 'stats' | 'settings'>('users');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingPlan, setEditingPlan] = useState<CreditPlan | null>(null);
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [initialCredits, setInitialCredits] = useState<number>(5);
  const [isUpdatingSetting, setIsUpdatingSetting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      setPlans(authService.getPlans());

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedUsers: User[] = (data || []).map(p => ({
        id: p.id,
        name: p.name,
        email: p.email,
        role: p.role,
        credits: p.credits,
        createdAt: new Date(p.created_at).getTime()
      }));

      setUsers(mappedUsers);

      // Fetch settings
      const { data: settingsData } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'initial_credits')
        .single();

      if (settingsData) {
        setInitialCredits(parseInt(settingsData.value));
      }
    } catch (err: any) {
      alert('Erro ao carregar dados: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user.id === id) {
      alert('Você não pode excluir sua própria conta administrativa!');
      return;
    }
    if (confirm('Tem certeza que deseja remover este usuário permanentemente?')) {
      try {
        const { error } = await supabase.from('profiles').delete().eq('id', id);
        if (error) throw error;
        await loadData();
      } catch (err: any) {
        alert('Erro ao deletar: ' + err.message);
      }
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      setIsLoading(true);
      try {
        await authService.updateUser(editingUser);
        setEditingUser(null);
        await loadData();
        alert('Usuário atualizado com sucesso!');
      } catch (err: any) {
        alert('Erro ao atualizar: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPlan) {
      let newPlans;
      if (plans.find(p => p.id === editingPlan.id)) {
        newPlans = plans.map(p => p.id === editingPlan.id ? editingPlan : p);
      } else {
        newPlans = [...plans, editingPlan];
      }
      authService.savePlans(newPlans);
      setPlans(newPlans);
      setEditingPlan(null);
    }
  };

  const handleDeletePlan = (id: string) => {
    if (confirm('Excluir este pacote de crédito?')) {
      const newPlans = plans.filter(p => p.id !== id);
      authService.savePlans(newPlans);
      setPlans(newPlans);
    }
  };

  const handleUpdateSetting = async (key: string, value: string) => {
    setIsUpdatingSetting(true);
    try {
      const { error } = await supabase
        .from('app_settings')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('key', key);

      if (error) throw error;

      if (key === 'initial_credits') {
        setInitialCredits(parseInt(value));
      }

      alert('Configuração salva com sucesso!');
    } catch (err: any) {
      alert('Erro ao salvar configuração: ' + err.message);
    } finally {
      setIsUpdatingSetting(false);
    }
  };

  const adjustCredits = (amount: number) => {
    if (editingUser) {
      setEditingUser({
        ...editingUser,
        credits: Math.max(0, editingUser.credits + amount)
      });
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = {
    totalUsers: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    totalCredits: users.reduce((acc, u) => acc + (u.credits || 0), 0),
    newToday: users.filter(u => new Date(u.createdAt).toDateString() === new Date().toDateString()).length
  };

  const iconOptions = [
    { value: 'zap', label: 'Raio', icon: <Zap size={16} /> },
    { value: 'star', label: 'Estrela', icon: <Star size={16} /> },
    { value: 'shield', label: 'Escudo', icon: <Shield size={16} /> },
    { value: 'coins', label: 'Moedas', icon: <Coins size={16} /> },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-8">

        {/* Sidebar Mini */}
        <div className="w-full md:w-64 flex flex-col gap-2">
          <button
            onClick={() => setActiveSubTab('users')}
            className={`flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all ${activeSubTab === 'users' ? 'bg-amber-400 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-amber-50'}`}
          >
            <Users size={20} /> Membros
          </button>
          <button
            onClick={() => setActiveSubTab('plans')}
            className={`flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all ${activeSubTab === 'plans' ? 'bg-amber-400 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-amber-50'}`}
          >
            <ShoppingBag size={20} /> Pacotes
          </button>
          <button
            onClick={() => setActiveSubTab('stats')}
            className={`flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all ${activeSubTab === 'stats' ? 'bg-amber-400 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-amber-50'}`}
          >
            <BarChart3 size={20} /> Relatórios
          </button>
          <button
            onClick={() => setActiveSubTab('settings')}
            className={`flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all ${activeSubTab === 'settings' ? 'bg-amber-400 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-amber-50'}`}
          >
            <Settings size={20} /> Sistema
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {isLoading && (
            <div className="flex items-center justify-center p-12">
              <RefreshCw className="animate-spin text-amber-500" size={40} />
            </div>
          )}

          {!isLoading && activeSubTab === 'users' && (
            <div className="glass-panel p-6 shadow-xl border-amber-100 min-h-[600px]">
              <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-bold brand-font text-slate-800">Gerenciamento de Membros</h2>
                  <p className="text-slate-500 text-sm">Controle permissões, dados e saldos manualmente.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                  <div className="relative flex-grow sm:flex-grow-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder="Nome ou e-mail..."
                      className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl border-2 border-amber-50 bg-white focus:border-amber-400 outline-none transition-all text-sm text-slate-700"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-100">
                    <Filter size={16} className="ml-2 text-slate-400" />
                    <select
                      value={roleFilter}
                      onChange={(e: any) => setRoleFilter(e.target.value)}
                      className="bg-white text-sm font-bold text-slate-600 outline-none pr-2 py-1.5 cursor-pointer"
                    >
                      <option value="all">Todos</option>
                      <option value="admin">Admins</option>
                      <option value="user">Usuários</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">
                      <th className="px-4 py-2">Usuário</th>
                      <th className="px-4 py-2">Créditos</th>
                      <th className="px-4 py-2">Papel</th>
                      <th className="px-4 py-2 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="bg-white/50 hover:bg-white transition-all group shadow-sm hover:shadow-md">
                        <td className="px-4 py-4 rounded-l-2xl border-y border-l border-amber-50">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-amber-700 font-black shadow-sm">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 leading-none mb-1">{user.name}</div>
                              <div className="text-xs text-slate-400 flex items-center gap-1">
                                <Mail size={12} /> {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 border-y border-amber-50">
                          <div className="flex items-center gap-1.5 font-black text-amber-600">
                            <Coins size={14} />
                            {user.credits}
                          </div>
                        </td>
                        <td className="px-4 py-4 border-y border-amber-50">
                          <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tight ${user.role === 'admin' ? 'bg-purple-100 text-purple-600 border border-purple-200' : 'bg-blue-100 text-blue-600 border border-blue-200'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-4 rounded-r-2xl border-y border-r border-amber-50 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => setEditingUser(user)}
                              className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
                            >
                              <Edit3 size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!isLoading && activeSubTab === 'plans' && (
            <div className="glass-panel p-6 shadow-xl border-amber-100 min-h-[600px]">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold brand-font text-slate-800">Gerenciar Pacotes</h2>
                  <p className="text-slate-500 text-sm">Personalize as ofertas da sua loja.</p>
                </div>
                <button
                  onClick={() => setEditingPlan({ id: Date.now().toString(), name: '', credits: 10, price: 'R$ ', icon: 'zap', color: 'blue' })}
                  className="flex items-center gap-2 bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-100 hover:scale-105 transition-all"
                >
                  <Plus size={20} /> Novo Pacote
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plans.map(plan => (
                  <div key={plan.id} className="bg-white p-5 rounded-3xl border-2 border-amber-50 flex items-center justify-between group shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl bg-slate-50`}>
                        {plan.icon === 'zap' && <Zap className="text-blue-500" />}
                        {plan.icon === 'star' && <Star className="text-amber-500" />}
                        {plan.icon === 'shield' && <Shield className="text-emerald-500" />}
                        {plan.icon === 'coins' && <Coins className="text-purple-500" />}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 flex items-center gap-2">
                          {plan.name}
                          {plan.popular && <span className="text-[9px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full uppercase">Popular</span>}
                        </div>
                        <div className="text-sm text-slate-500 font-medium">
                          {plan.credits} créditos • <span className="text-amber-600 font-black">{plan.price}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setEditingPlan(plan)} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all">
                        <Edit3 size={18} />
                      </button>
                      <button onClick={() => handleDeletePlan(plan.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isLoading && activeSubTab === 'stats' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-panel p-6 border-amber-100 shadow-lg bg-gradient-to-br from-white to-amber-50">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-amber-100 rounded-2xl text-amber-600">
                    <Users size={24} />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-800 mb-1">{stats.totalUsers}</div>
                <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total de Membros</div>
              </div>

              <div className="glass-panel p-6 border-purple-100 shadow-lg bg-gradient-to-br from-white to-purple-50">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-purple-100 rounded-2xl text-purple-600">
                    <ShieldCheck size={24} />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-800 mb-1">{stats.admins}</div>
                <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Administradores</div>
              </div>

              <div className="glass-panel p-6 border-blue-100 shadow-lg bg-gradient-to-br from-white to-blue-50">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-100 rounded-2xl text-blue-600">
                    <Coins size={24} />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-800 mb-1">{stats.totalCredits}</div>
                <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Créditos em Circulação</div>
              </div>

              <div className="glass-panel p-6 border-emerald-100 shadow-lg bg-gradient-to-br from-white to-emerald-50">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600">
                    <RefreshCw size={24} />
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-800 mb-1">{stats.newToday}</div>
                <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Novos Hoje</div>
              </div>
            </div>
          )}

          {!isLoading && activeSubTab === 'settings' && (
            <div className="glass-panel p-8 border-amber-100 shadow-xl">
              <h2 className="text-2xl font-bold brand-font text-slate-800 mb-8">Configurações Gerais</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100">
                  <div>
                    <div className="font-bold text-slate-700">Modo de Manutenção</div>
                    <div className="text-xs text-slate-400">Impede gerações e compras temporariamente.</div>
                  </div>
                  <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-pointer opacity-50">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100">
                  <div>
                    <div className="font-bold text-slate-700">Créditos Iniciais</div>
                    <div className="text-xs text-slate-400">Quantidade de bônus para novos cadastros.</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="0"
                      className="w-20 text-center font-black text-amber-600 text-lg bg-white px-2 py-1 rounded-xl shadow-sm border border-amber-100 focus:border-amber-400 outline-none"
                      value={initialCredits}
                      onChange={(e) => setInitialCredits(parseInt(e.target.value) || 0)}
                    />
                    <button
                      onClick={() => handleUpdateSetting('initial_credits', initialCredits.toString())}
                      disabled={isUpdatingSetting}
                      className="p-2 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200 transition-colors disabled:opacity-50"
                      title="Salvar"
                    >
                      {isUpdatingSetting ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Plan Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setEditingPlan(null)}></div>
          <div className="relative w-full max-w-lg glass-panel bg-white shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="bg-emerald-500 p-6 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <ShoppingBag size={24} />
                <h2 className="text-xl font-bold brand-font">Configurar Pacote</h2>
              </div>
              <button onClick={() => setEditingPlan(null)}><X size={24} /></button>
            </div>

            <form onSubmit={handleSavePlan} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400">Nome do Pacote</label>
                  <input
                    type="text" required
                    className="w-full p-3 rounded-xl border-2 border-slate-50 bg-white focus:border-amber-400 outline-none text-slate-700 font-bold"
                    value={editingPlan.name}
                    onChange={e => setEditingPlan({ ...editingPlan, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400">Créditos</label>
                  <input
                    type="number" required
                    className="w-full p-3 rounded-xl border-2 border-slate-50 bg-white focus:border-amber-400 outline-none text-slate-700 font-black"
                    value={editingPlan.credits}
                    onChange={e => setEditingPlan({ ...editingPlan, credits: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400">Preço (Ex: R$ 20,00)</label>
                  <input
                    type="text" required
                    className="w-full p-3 rounded-xl border-2 border-slate-50 bg-white focus:border-amber-400 outline-none text-slate-700 font-bold"
                    value={editingPlan.price}
                    onChange={e => setEditingPlan({ ...editingPlan, price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400">Ícone</label>
                  <select
                    className="w-full p-3 rounded-xl border-2 border-slate-50 bg-white focus:border-amber-400 outline-none font-bold"
                    value={editingPlan.icon}
                    onChange={(e: any) => setEditingPlan({ ...editingPlan, icon: e.target.value })}
                  >
                    {iconOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400">Opção em Destaque?</label>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      checked={editingPlan.popular}
                      onChange={e => setEditingPlan({ ...editingPlan, popular: e.target.checked })}
                      className="w-5 h-5 accent-amber-500"
                    />
                    <span className="text-sm font-bold text-slate-600">Sim, destacar na loja</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setEditingPlan(null)} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-100">Salvar Pacote</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setEditingUser(null)}></div>
          <div className="relative w-full max-w-xl glass-panel bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-amber-400 p-6 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <UserCog size={24} />
                <h2 className="text-xl font-bold brand-font">Editar Membro</h2>
              </div>
              <button onClick={() => setEditingUser(null)} className="hover:rotate-90 transition-transform">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    className="w-full p-3 rounded-xl border-2 border-slate-50 bg-white focus:border-amber-400 outline-none transition-all font-bold text-slate-700"
                    value={editingUser.name}
                    onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">E-mail</label>
                  <input
                    type="email"
                    required
                    className="w-full p-3 rounded-xl border-2 border-slate-50 bg-white focus:border-amber-400 outline-none transition-all font-bold text-slate-700"
                    value={editingUser.email}
                    onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Permissão</label>
                  <select
                    className="w-full p-3 rounded-xl border-2 border-slate-50 bg-white focus:border-amber-400 outline-none transition-all font-bold text-slate-700 cursor-pointer"
                    value={editingUser.role}
                    onChange={(e: any) => setEditingUser({ ...editingUser, role: e.target.value })}
                  >
                    <option value="user">Usuário Comum</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Saldo de Créditos</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      className="w-full p-3 rounded-xl border-2 border-slate-50 bg-white focus:border-amber-400 outline-none transition-all font-black text-amber-600 text-center"
                      value={editingUser.credits}
                      onChange={e => setEditingUser({ ...editingUser, credits: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-2xl space-y-3">
                <div className="text-xs font-black uppercase text-amber-600 tracking-widest flex items-center gap-2 mb-2">
                  <Coins size={14} /> Atalhos de Saldo
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => adjustCredits(10)} className="flex-1 bg-white border border-amber-200 py-2 rounded-xl text-xs font-bold hover:bg-amber-100 transition-colors flex items-center justify-center gap-1">
                    <ArrowUpCircle size={14} /> +10
                  </button>
                  <button type="button" onClick={() => adjustCredits(50)} className="flex-1 bg-white border border-amber-200 py-2 rounded-xl text-xs font-bold hover:bg-amber-100 transition-colors flex items-center justify-center gap-1">
                    <ArrowUpCircle size={14} /> +50
                  </button>
                  <button type="button" onClick={() => adjustCredits(-10)} className="flex-1 bg-white border border-amber-200 py-2 rounded-xl text-xs font-bold hover:bg-red-50 hover:text-red-500 transition-colors flex items-center justify-center gap-1">
                    <ArrowDownCircle size={14} /> -10
                  </button>
                  <button type="button" onClick={() => setEditingUser({ ...editingUser, credits: 0 })} className="flex-1 bg-white border border-red-100 py-2 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-colors">
                    Zerar Saldo
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-3 bg-amber-400 text-white rounded-xl font-bold shadow-lg shadow-amber-200 hover:bg-amber-500 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={20} /> Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
