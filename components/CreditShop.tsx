
import React, { useEffect, useState } from 'react';
import { Coins, Zap, Star, ShieldCheck, ShoppingCart, ArrowLeft } from 'lucide-react';
import { User, CreditPlan } from '../types';
import { authService } from '../services/authService';

interface CreditShopProps {
  user: User;
  onPurchase: (amount: number) => void;
  onBack: () => void;
}

const iconMap = {
  zap: <Zap className="text-blue-500" />,
  star: <Star className="text-amber-500" />,
  shield: <ShieldCheck className="text-emerald-500" />,
  coins: <Coins className="text-purple-500" />
};

const CreditShop: React.FC<CreditShopProps> = ({ user, onPurchase, onBack }) => {
  const [plans, setPlans] = useState<CreditPlan[]>([]);

  useEffect(() => {
    setPlans(authService.getPlans());
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-slate-500 hover:text-amber-600 font-bold transition-colors"
      >
        <ArrowLeft size={20} /> Voltar para o App
      </button>

      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold brand-font text-slate-800 mb-4">Loja de Bênçãos</h2>
        <p className="text-slate-500 max-w-xl mx-auto">
          Seus créditos gratuitos acabaram? Recarregue para continuar criando artes bíblicas maravilhosas para suas crianças.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`relative glass-panel p-8 border-2 transition-all hover:scale-[1.03] ${
              plan.popular ? 'border-amber-400 shadow-xl scale-105' : 'border-slate-100 shadow-lg'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                Mais Popular
              </div>
            )}

            <div className="flex flex-col items-center text-center">
              <div className={`p-4 rounded-3xl bg-slate-50 mb-6`}>
                {/* FIX: Use React.ReactElement<any> to avoid "No overload matches this call" error when passing 'size' prop */}
                {React.cloneElement((iconMap[plan.icon] || iconMap.coins) as React.ReactElement<any>, { size: 40 })}
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 mb-2">{plan.name}</h3>
              <div className="flex items-center gap-2 mb-6">
                <Coins className="text-amber-500" size={24} />
                <span className="text-3xl font-black text-slate-800">{plan.credits}</span>
                <span className="text-slate-400 font-bold">créditos</span>
              </div>

              <div className="text-2xl font-black text-slate-700 mb-8">{plan.price}</div>

              <button 
                onClick={() => onPurchase(plan.credits)}
                className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg ${
                  plan.popular 
                    ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-amber-200' 
                    : 'bg-white border-2 border-slate-100 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <ShoppingCart size={20} />
                Comprar Agora
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 p-8 bg-amber-50/50 rounded-[2.5rem] border border-amber-100 text-center">
        <h4 className="font-bold text-slate-700 mb-2">Por que cobramos?</h4>
        <p className="text-sm text-slate-500 max-w-2xl mx-auto">
          A inteligência artificial que gera essas imagens consome processamento de alto custo. 
          Sua contribuição ajuda a manter o projeto ativo e livre de anúncios para as crianças.
        </p>
      </div>
    </div>
  );
};

export default CreditShop;
