
import React, { useState } from 'react';
import { User as UserIcon, Mail, Shield, Calendar, Coins, Save, CheckCircle2, AlertCircle, Phone, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { User } from '../types';
import { authService } from '../services/authService';

interface UserProfileProps {
    user: User;
    onUpdate: (user: User) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdate }) => {
    const [name, setName] = useState(user.name);
    const [phone, setPhone] = useState(user.phone || '');
    const [isLoading, setIsLoading] = useState(false);
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [passwordData, setPasswordData] = useState({ password: '', confirmPassword: '' });

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);
        setMessage(null);

        try {
            const updatedUser = { ...user, name: name.trim(), phone: phone.trim() };
            await authService.updateUser(updatedUser);
            onUpdate(updatedUser);
            setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Erro ao atualizar perfil.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.password !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'As senhas não coincidem.' });
            return;
        }
        if (passwordData.password.length < 6) {
            setMessage({ type: 'error', text: 'A senha deve ter pelo menos 6 caracteres.' });
            return;
        }

        setIsPasswordLoading(true);
        setMessage(null);

        try {
            await authService.updatePassword(passwordData.password);
            setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
            setPasswordData({ password: '', confirmPassword: '' });
            setShowPasswordSection(false);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Erro ao alterar senha.' });
        } finally {
            setIsPasswordLoading(false);
        }
    };

    const formattedDate = new Date(user.createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className="w-full max-w-2xl mx-auto px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="glass-panel p-8 border-amber-200">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center shadow-inner">
                        <UserIcon size={40} className="text-amber-500" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold brand-font text-slate-800">Seu Perfil</h2>
                        <p className="text-slate-500">Gerencie suas informações pessoais</p>
                    </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-600 ml-2">Nome Completo</label>
                        <div className="relative">
                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Seu nome"
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-amber-50 bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-100 outline-none transition-all text-lg text-slate-700 font-medium"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-600 ml-2">Telefone (WhatsApp)</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Seu WhatsApp"
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-amber-50 bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-100 outline-none transition-all text-lg text-slate-700 font-medium"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center gap-3">
                            <Mail className="text-slate-400" size={20} />
                            <div>
                                <p className="text-xs text-slate-400 uppercase font-bold">E-mail</p>
                                <p className="text-slate-600 font-medium">{user.email}</p>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center gap-3">
                            <Shield className="text-slate-400" size={20} />
                            <div>
                                <p className="text-xs text-slate-400 uppercase font-bold">Tipo de Conta</p>
                                <p className="text-slate-600 font-medium capitalize">{user.role === 'admin' ? 'Administrador' : 'Explorador'}</p>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center gap-3">
                            <Calendar className="text-slate-400" size={20} />
                            <div>
                                <p className="text-xs text-slate-400 uppercase font-bold">Membro desde</p>
                                <p className="text-slate-600 font-medium">{formattedDate}</p>
                            </div>
                        </div>

                        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-3">
                            <Coins className="text-amber-500" size={20} />
                            <div>
                                <p className="text-xs text-amber-500/70 uppercase font-bold">Saldo Atual</p>
                                <p className="text-amber-700 font-black text-lg">{user.credits} créditos</p>
                            </div>
                        </div>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-xl flex items-center gap-3 animate-in zoom-in-95 duration-200 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                            <span className="font-medium">{message.text}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || (name === user.name && phone === (user.phone || '')) || !name.trim()}
                        className="w-full py-4 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-amber-200 transition-all transform active:scale-95 disabled:opacity-50 disabled:grayscale disabled:scale-100 flex items-center justify-center gap-2"
                    >
                        {isLoading ? 'Salvando...' : (
                            <>
                                <Save size={20} />
                                Salvar Alterações
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-slate-100">
                    <button
                        onClick={() => setShowPasswordSection(!showPasswordSection)}
                        className="flex items-center justify-between w-full p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                <Lock size={20} className="text-slate-400" />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-slate-700">Segurança</p>
                                <p className="text-xs text-slate-400">Alterar sua senha de acesso</p>
                            </div>
                        </div>
                        {showPasswordSection ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
                    </button>

                    {showPasswordSection && (
                        <form onSubmit={handlePasswordChange} className="mt-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Nova Senha</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="password"
                                        required
                                        placeholder="No mínimo 6 caracteres"
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-50 bg-white focus:border-amber-400 outline-none transition-all font-bold text-slate-700"
                                        value={passwordData.password}
                                        onChange={e => setPasswordData({ ...passwordData, password: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Confirmar Nova Senha</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="password"
                                        required
                                        placeholder="Repita a nova senha"
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-50 bg-white focus:border-amber-400 outline-none transition-all font-bold text-slate-700"
                                        value={passwordData.confirmPassword}
                                        onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isPasswordLoading || !passwordData.password || passwordData.password !== passwordData.confirmPassword}
                                className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold shadow-lg transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isPasswordLoading ? 'Processando...' : 'Atualizar Senha'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
