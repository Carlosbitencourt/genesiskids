
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import ImageDisplay from './components/ImageDisplay';
import AuthModal from './components/AuthModal';
import StoryMode from './components/StoryMode';
import PosterMode from './components/PosterMode';
import AdminDashboard from './components/AdminDashboard';
import CreditShop from './components/CreditShop';
import UserProfile from './components/UserProfile';
import BibleStoryAI from './components/BibleStoryAI';
import { generateBiblicalAnimeImage } from './services/geminiService';
import { authService } from './services/authService';
import { abacatepayService } from './services/abacatepayService';
import PixPaymentModal from './components/PixPaymentModal';
import { GeneratedImage, User, AppTab, PixData } from './types';
import { AlertCircle, Coins } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<AppTab>('single');
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [gallery, setGallery] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);
  const [pendingCredits, setPendingCredits] = useState<number | null>(null);

  useEffect(() => {
    const initSession = async () => {
      const session = await authService.getSession();
      if (session) setUser(session);
    };
    initSession();

    const savedGallery = localStorage.getItem('genesis_kids_gallery');
    if (savedGallery) setGallery(JSON.parse(savedGallery));
  }, []);

  // Polling for payment success
  useEffect(() => {
    let interval: any;

    if (isPixModalOpen && pixData) {
      interval = setInterval(async () => {
        try {
          const status = await abacatepayService.checkPaymentStatus(pixData.id);
          if (status === 'PAID') {
            clearInterval(interval);
            handlePaymentSuccess();
          } else if (status === 'EXPIRED') {
            clearInterval(interval);
            setIsPixModalOpen(false);
            setError("O pagamento expirou. Tente novamente.");
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPixModalOpen, pixData]);

  const handlePaymentSuccess = async () => {
    if (!user || pendingCredits === null) return;

    try {
      const updatedUser = { ...user, credits: user.credits + pendingCredits };
      await authService.updateUser(updatedUser);
      setUser(updatedUser);
      setPixData(null);
      setIsPixModalOpen(false);
      setPendingCredits(null);
      alert(`Sucesso! ${pendingCredits} créditos foram adicionados à sua conta.`);
    } catch (err) {
      setError("Erro ao atualizar créditos após pagamento.");
    }
  };

  const addToGallery = (img: GeneratedImage) => {
    try {
      const newGallery = [img, ...gallery].slice(0, 10);
      setGallery(newGallery);
      localStorage.setItem('genesis_kids_gallery', JSON.stringify(newGallery));
    } catch (err) {
      console.warn("Não foi possível salvar na galeria (espaço insuficiente no navegador)");
      // Only keep in state if localStorage fails
    }
  };

  const deductCredits = async (amount: number): Promise<boolean> => {
    if (!user) return false;
    if (user.credits < amount) {
      setError(`Saldo insuficiente! Você precisa de ${amount} créditos.`);
      setActiveTab('shop');
      return false;
    }

    const updatedUser = { ...user, credits: user.credits - amount };
    setUser(updatedUser);
    try {
      await authService.updateUser(updatedUser);
      return true;
    } catch (err) {
      setError("Erro ao atualizar créditos no banco de dados.");
      // Rollback UI state if database update fails
      setUser(user);
      return false;
    }
  };

  const handleGenerateSingle = async (prompt: string, ageRange: string) => {
    if (!user) {
      setPendingAction(() => () => handleGenerateSingle(prompt, ageRange));
      setIsAuthModalOpen(true);
      return;
    }

    // Tenta deduzir 1 crédito
    if (!(await deductCredits(1))) return;

    setIsLoading(true);
    setError(null);
    setCurrentImage(null);

    try {
      const base64Image = await generateBiblicalAnimeImage(prompt, ageRange);
      if (base64Image) {
        const newImg = {
          id: Date.now().toString(),
          url: base64Image,
          prompt: prompt,
          createdAt: Date.now(),
        };
        setCurrentImage(newImg);
        addToGallery(newImg);
      } else {
        // Estorna o crédito em caso de erro da IA
        const stornoUser = { ...user, credits: user.credits + 1 };
        setUser(stornoUser);
        await authService.updateUser(stornoUser);
        setError("Não foi possível gerar a imagem. Seu crédito foi devolvido.");
      }
    } catch (err: any) {
      console.error("Erro na geração:", err);
      setError("Erro ao processar imagem. Verifique sua conexão e tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (amount: number) => {
    if (!user) return;

    const plans = authService.getPlans();
    const plan = plans.find(p => p.credits === amount);
    if (!plan) return;

    const phoneNumber = "5571996820807";
    const message = encodeURIComponent(`Quero recarregar na plataforma o valor de ${plan.price}`);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

    window.open(whatsappUrl, '_blank');
  };

  const handleAuthSuccess = (loggedUser: User) => {
    setUser(loggedUser);
    setIsAuthModalOpen(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  return (
    <div className="min-h-screen pb-12 flex flex-col relative overflow-hidden bg-gradient-to-b from-[#FFF5F5] to-[#FFF8E1]">
      <Header
        user={user}
        onLogout={async () => { await authService.logout(); setUser(null); setActiveTab('single'); }}
        onLoginClick={() => setIsAuthModalOpen(true)}
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (!user && (tab === 'story' || tab === 'poster' || tab === 'admin' || tab === 'shop' || tab === 'profile' || tab === 'bible-story')) {
            setIsAuthModalOpen(true);
            return;
          }
          if (tab === 'admin' && user?.role !== 'admin') {
            setError("Acesso restrito a administradores.");
            return;
          }
          setActiveTab(tab);
        }}
      />

      <main className="container mx-auto px-4 flex-grow flex flex-col items-center gap-8">

        {activeTab === 'single' && (
          <>
            <div className="flex items-center gap-2 bg-amber-100/50 px-4 py-1.5 rounded-full text-amber-700 font-bold text-xs uppercase tracking-widest border border-amber-200">
              <Coins size={14} /> 1 crédito por arte
            </div>
            <InputForm onGenerate={handleGenerateSingle} isLoading={isLoading} />
            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-xl animate-bounce-slow">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}
            <ImageDisplay image={currentImage} isLoading={isLoading} />
          </>
        )}

        {activeTab === 'story' && (
          <StoryMode
            user={user}
            onDeductCredits={deductCredits}
            onStartLoading={() => { setIsLoading(true); setError(null); }}
            onEndLoading={(err) => { setIsLoading(false); if (err) setError(err); }}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'bible-story' && (
          <BibleStoryAI
            user={user}
            onDeductCredits={deductCredits}
            onStartLoading={() => { setIsLoading(true); setError(null); }}
            onEndLoading={(err) => { setIsLoading(false); if (err) setError(err); }}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'poster' && (
          <PosterMode gallery={gallery} />
        )}

        {activeTab === 'admin' && user?.role === 'admin' && (
          <AdminDashboard />
        )}

        {activeTab === 'shop' && user && (
          <CreditShop
            user={user}
            onPurchase={handlePurchase}
            onBack={() => setActiveTab('single')}
          />
        )}

        {activeTab === 'profile' && user && (
          <UserProfile
            user={user}
            onUpdate={(updatedUser) => setUser(updatedUser)}
          />
        )}

      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {pixData && (
        <PixPaymentModal
          isOpen={isPixModalOpen}
          onClose={() => setIsPixModalOpen(false)}
          pixData={pixData}
        />
      )}

      <footer className="mt-12 text-center text-slate-400 text-sm py-8 border-t border-amber-100/30">
        <p>© 2025 Genesis Kids - Criando Histórias Sagradas com Carinho</p>
      </footer>
    </div>
  );
};

export default App;
