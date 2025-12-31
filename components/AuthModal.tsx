
import React, { useState } from 'react';
import { X, UserPlus, LogIn, Mail, Lock, User as UserIcon, Phone } from 'lucide-react';
import { authService } from '../services/authService';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        const user = await authService.login(formData.email, formData.password);
        onSuccess(user);
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('As senhas não coincidem.');
        }
        if (!formData.name) throw new Error('Por favor, digite seu nome.');
        if (!formData.phone) throw new Error('Por favor, digite seu telefone.');

        const user = await authService.signup(formData.name, formData.email, formData.password, formData.phone);
        onSuccess(user);
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative w-full max-w-md glass-panel bg-white/95 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              {isLogin ? <LogIn className="text-amber-500" size={32} /> : <UserPlus className="text-amber-500" size={32} />}
            </div>
            <h2 className="text-3xl font-bold brand-font text-slate-800">
              {isLogin ? 'Bem-vindo de volta!' : 'Criar sua conta'}
            </h2>
            <p className="text-slate-500 mt-2 text-center">
              {isLogin
                ? 'Entre para continuar criando artes mágicas.'
                : 'Cadastre-se para salvar suas criações favoritas.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Seu nome"
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-amber-50 bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-100 outline-none transition-all text-slate-700"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="email"
                placeholder="E-mail"
                required
                className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-amber-50 bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-100 outline-none transition-all text-slate-700"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {!isLogin && (
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Seu telefone (WhatsApp)"
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-amber-50 bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-100 outline-none transition-all text-slate-700"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            )}

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="password"
                placeholder="Senha"
                required
                className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-amber-50 bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-100 outline-none transition-all text-slate-700"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            {!isLogin && (
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="password"
                  placeholder="Confirmar Senha"
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-amber-50 bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-100 outline-none transition-all text-slate-700"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
            )}

            {error && (
              <p className="text-red-500 text-sm font-medium text-center bg-red-50 py-2 rounded-xl">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-amber-200 transition-all transform active:scale-95"
            >
              {isLogin ? 'Entrar' : 'Começar a Criar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-slate-500 hover:text-amber-500 transition-colors text-sm font-semibold"
            >
              {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre aqui'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
