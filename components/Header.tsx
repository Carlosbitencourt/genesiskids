
import React from 'react';
import { Sparkles, Heart, LogOut, User as UserIcon, BookOpen, Image as ImageIcon, LayoutTemplate, ShieldAlert, Coins, PlusCircle } from 'lucide-react';
import { User, AppTab } from '../types';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  onLoginClick: () => void;
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onLoginClick, activeTab, onTabChange }) => {
  const isAdmin = user?.role === 'admin';

  return (
    <header className="w-full pt-6 pb-2 px-4 flex flex-col items-center justify-center text-center relative border-b border-amber-100/50 mb-6">
      <div className="absolute top-6 right-4 sm:right-8 flex items-center gap-4">
        {user && (
          <div
            onClick={() => onTabChange('shop')}
            className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-full border border-amber-200 shadow-sm cursor-pointer hover:bg-amber-100 transition-all group"
          >
            <Coins className="text-amber-500 group-hover:rotate-12 transition-transform" size={18} />
            <span className="font-black text-amber-700">{user.credits}</span>
            <PlusCircle className="text-amber-400 ml-1" size={16} />
          </div>
        )}

        {user ? (
          <div className="flex items-center gap-3 bg-white/60 p-1 pl-4 rounded-full border border-white/80 shadow-sm group">
            <span className="text-slate-700 font-bold text-sm hidden sm:block">Olá, {user.name.split(' ')[0]}!</span>
            <button
              onClick={() => onTabChange('profile')}
              className={`w-10 h-10 ${activeTab === 'profile' ? 'bg-amber-400 text-white shadow-md' : (isAdmin ? 'bg-purple-100 text-purple-500' : 'bg-amber-100 text-amber-500')} rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95`}
              title="Meu Perfil"
            >
              {isAdmin ? <ShieldAlert size={20} /> : <UserIcon size={20} />}
            </button>
            <button
              onClick={onLogout}
              className="p-2 hover:bg-red-50 hover:text-red-500 text-slate-400 rounded-full transition-all"
              title="Sair"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <button
            onClick={onLoginClick}
            className="px-6 py-2 bg-white/80 hover:bg-white text-amber-600 rounded-full font-bold text-sm border border-amber-100 shadow-sm transition-all hover:shadow-md active:scale-95"
          >
            Entrar
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 mb-3 animate-bounce-slow">
        <Sparkles className="w-10 h-10 text-amber-400 fill-amber-100" />
        <h1 className="text-4xl md:text-5xl font-bold brand-font text-slate-800 tracking-wide drop-shadow-sm">
          Genesis Kids
        </h1>
        <Heart className="w-8 h-8 text-pink-400 fill-pink-100" />
      </div>

      <div className="flex flex-wrap justify-center gap-2 p-1.5 bg-amber-100/40 rounded-2xl backdrop-blur-md mb-4 mt-4 max-w-full overflow-x-auto">
        <button
          onClick={() => onTabChange('single')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'single' ? 'bg-white text-amber-600 shadow-sm' : 'text-amber-700/60 hover:text-amber-700'
            }`}
        >
          <ImageIcon size={20} />
          Arte Única
        </button>
        <button
          onClick={() => onTabChange('story')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'story' ? 'bg-white text-amber-600 shadow-sm' : 'text-amber-700/60 hover:text-amber-700'
            }`}
        >
          <BookOpen size={20} />
          Histórias
        </button>
        <button
          onClick={() => onTabChange('poster')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'poster' ? 'bg-white text-amber-600 shadow-sm' : 'text-amber-700/60 hover:text-amber-700'
            }`}
        >
          <LayoutTemplate size={20} />
          Pôster Mágico
        </button>
        {isAdmin && (
          <button
            onClick={() => onTabChange('admin')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'admin' ? 'bg-purple-500 text-white shadow-md' : 'text-purple-700/60 hover:text-purple-700'
              }`}
          >
            <ShieldAlert size={20} />
            Painel Admin
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
