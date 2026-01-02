
import React from 'react';
import { Sparkles, Heart, LogOut, User as UserIcon, BookOpen, Image as ImageIcon, LayoutTemplate, ShieldAlert, Coins, PlusCircle, FileText, ScanSearch } from 'lucide-react';
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
    <header className="w-full pt-4 pb-2 px-4 flex flex-col items-center border-b border-amber-100/50 mb-6 bg-white/30 backdrop-blur-sm relative">
      {/* Top Section: User Actions & Credits */}
      <div className="w-full max-w-6xl flex flex-row justify-between items-center gap-4 mb-4 sm:mb-8">

        {/* Logo Section - Primary branding */}
        <div className="flex items-center gap-2 sm:gap-3 animate-bounce-slow">
          <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400 fill-amber-100" />
          <h1 className="text-xl sm:text-3xl md:text-5xl font-bold brand-font text-slate-800 tracking-tight sm:tracking-wide drop-shadow-sm">
            Genesis Kids
          </h1>
          <Heart className="w-5 h-5 sm:w-7 sm:h-7 text-pink-400 fill-pink-100 hidden xs:block" />
        </div>

        {/* User Actions Section */}
        <div className="flex items-center gap-2 sm:gap-4">
          {user && (
            <div
              onClick={() => onTabChange('shop')}
              className="flex items-center gap-1 sm:gap-2 bg-amber-50 px-2.5 sm:px-4 py-1.5 rounded-full border border-amber-200 shadow-sm cursor-pointer hover:bg-amber-100 transition-all group"
            >
              <Coins className="text-amber-500 group-hover:rotate-12 transition-transform" size={16} />
              <span className="font-black text-amber-700 text-xs sm:text-base">{user.credits}</span>
              <PlusCircle className="text-amber-400 hidden sm:block" size={14} />
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-1 sm:gap-3 bg-white/60 p-0.5 sm:p-1 pl-2 sm:pl-4 rounded-full border border-white/80 shadow-sm group">
              <span className="text-slate-700 font-bold text-xs sm:text-sm hidden lg:block text-nowrap">Olá, {user.name.split(' ')[0]}!</span>
              <button
                onClick={() => onTabChange('profile')}
                className={`w-8 h-8 sm:w-10 sm:h-10 ${activeTab === 'profile' ? 'bg-amber-400 text-white shadow-md' : (isAdmin ? 'bg-purple-100 text-purple-500' : 'bg-amber-100 text-amber-500')} rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95`}
                title="Meu Perfil"
              >
                {isAdmin ? <ShieldAlert size={16} /> : <UserIcon size={18} />}
              </button>
              <button
                onClick={onLogout}
                className="p-1.5 sm:p-2 hover:bg-red-50 hover:text-red-500 text-slate-400 rounded-full transition-all"
                title="Sair"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="px-4 sm:px-6 py-1.5 sm:py-2 bg-white/80 hover:bg-white text-amber-600 rounded-full font-bold text-xs sm:text-sm border border-amber-100 shadow-sm transition-all hover:shadow-md active:scale-95 text-nowrap"
            >
              Entrar
            </button>
          )}
        </div>
      </div>

      {/* Tabs Section */}
      <div className="flex flex-wrap justify-center gap-2 p-1 bg-amber-100/40 rounded-2xl backdrop-blur-md mb-2 max-w-full">
        <button
          onClick={() => onTabChange('single')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 rounded-xl font-bold transition-all text-sm sm:text-base whitespace-nowrap ${activeTab === 'single' ? 'bg-white text-amber-600 shadow-sm' : 'text-amber-700/60 hover:text-amber-700'
            }`}
        >
          <ImageIcon size={18} />
          <span className="xs:inline">Arte Única</span>
        </button>
        <button
          onClick={() => onTabChange('story')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 rounded-xl font-bold transition-all text-sm sm:text-base whitespace-nowrap ${activeTab === 'story' ? 'bg-white text-amber-600 shadow-sm' : 'text-amber-700/60 hover:text-amber-700'
            }`}
        >
          <BookOpen size={18} />
          <span className="xs:inline">Cenas</span>
        </button>
        <button
          onClick={() => onTabChange('bible-story')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 rounded-xl font-bold transition-all text-sm sm:text-base whitespace-nowrap ${activeTab === 'bible-story' ? 'bg-white text-amber-600 shadow-sm' : 'text-amber-700/60 hover:text-amber-700'
            }`}
        >
          <FileText size={18} />
          <span className="xs:inline">Contos IA</span>
        </button>
        <button
          onClick={() => onTabChange('summarize')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 rounded-xl font-bold transition-all text-sm sm:text-base whitespace-nowrap ${activeTab === 'summarize' ? 'bg-white text-amber-600 shadow-sm' : 'text-amber-700/60 hover:text-amber-700'
            }`}
        >
          <ScanSearch size={18} />
          <span className="xs:inline">Resumir</span>
        </button>
        <button
          onClick={() => onTabChange('poster')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 rounded-xl font-bold transition-all text-sm sm:text-base whitespace-nowrap ${activeTab === 'poster' ? 'bg-white text-amber-600 shadow-sm' : 'text-amber-700/60 hover:text-amber-700'
            }`}
        >
          <LayoutTemplate size={18} />
          <span className="xs:inline">Pôster Mágico</span>
        </button>
        {isAdmin && (
          <button
            onClick={() => onTabChange('admin')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 rounded-xl font-bold transition-all text-sm sm:text-base whitespace-nowrap ${activeTab === 'admin' ? 'bg-purple-500 text-white shadow-md' : 'text-purple-700/60 hover:text-purple-700'
              }`}
          >
            <ShieldAlert size={18} />
            <span className="xs:inline">Admin</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
