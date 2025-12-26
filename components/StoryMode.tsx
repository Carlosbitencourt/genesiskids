
import React, { useState } from 'react';
import { BookOpen, Wand2, Download, CheckCircle2, Coins } from 'lucide-react';
import { Story, StoryScene, User } from '../types';
import { generateStoryScenes, generateBiblicalAnimeImage } from '../services/geminiService';

interface StoryModeProps {
  user: User | null;
  onDeductCredits: (amount: number) => Promise<boolean>;
  onStartLoading: () => void;
  onEndLoading: (error?: string) => void;
  isLoading: boolean;
}

const StoryMode: React.FC<StoryModeProps> = ({ user, onDeductCredits, onStartLoading, onEndLoading, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [ageRange, setAgeRange] = useState('5-8');
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    // Exige 3 créditos para a história completa (3 cenas)
    if (!(await onDeductCredits(3))) return;

    onStartLoading();
    setGenerationProgress(0);
    setCurrentStory(null);

    try {
      const { scenes: sceneDescriptions } = await generateStoryScenes(prompt);

      const storyScenes: StoryScene[] = [];

      for (let i = 0; i < sceneDescriptions.length; i++) {
        setGenerationProgress(((i) / sceneDescriptions.length) * 100);
        const sceneData = sceneDescriptions[i];

        const imageUrl = await generateBiblicalAnimeImage(sceneData.prompt, ageRange);

        if (imageUrl) {
          storyScenes.push({
            id: Date.now().toString() + i,
            image: imageUrl,
            description: sceneData.title,
            prompt: sceneData.prompt
          });
        }
      }

      setGenerationProgress(100);
      setCurrentStory({
        id: Date.now().toString(),
        title: prompt,
        scenes: storyScenes,
        createdAt: Date.now()
      });
      onEndLoading();
    } catch (err: any) {
      console.error(err);
      onEndLoading("Erro ao criar história. Verifique seu saldo ou tente novamente.");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 animate-in fade-in duration-500">
      <div className="glass-panel p-8 mb-8 border-amber-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold brand-font text-slate-800 flex items-center gap-2">
            <BookOpen className="text-amber-500" />
            Conte uma História Bíblica
          </h2>
          <div className="flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full font-black text-sm uppercase">
            <Coins size={16} /> Custo: 3 créditos
          </div>
        </div>

        <form onSubmit={handleCreateStory} className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="font-bold text-slate-600 ml-2">Qual aventura vamos contar?</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: A história de José e sua túnica colorida no Egito..."
              className="w-full p-5 rounded-3xl bg-white border-2 border-amber-50 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 outline-none transition-all text-lg min-h-[120px] resize-none shadow-inner text-slate-700"
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2 p-1 bg-amber-50 rounded-2xl overflow-x-auto max-w-full">
              {['1-3', '5-8', '10-15'].map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setAgeRange(range)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${ageRange === range ? 'bg-amber-400 text-white shadow-md' : 'text-slate-500 hover:bg-white'
                    }`}
                >
                  {range} anos
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={!prompt.trim() || isLoading}
              className="px-8 py-4 bg-gradient-to-r from-orange-400 to-amber-400 text-white rounded-2xl font-bold text-lg flex items-center gap-3 shadow-lg shadow-amber-200 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all"
            >
              {isLoading ? 'Criando...' : 'Gerar História'}
              <Wand2 size={24} />
            </button>
          </div>
        </form>

        {isLoading && (
          <div className="mt-8 space-y-3">
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 transition-all duration-1000"
                style={{ width: `${generationProgress}%` }}
              ></div>
            </div>
            <p className="text-center text-slate-500 font-medium animate-pulse">
              Pintando a cena {Math.min(Math.ceil(generationProgress / 33) + 1, 3)} de 3...
            </p>
          </div>
        )}
      </div>

      {currentStory && (
        <div className="space-y-12 pb-12">
          <div className="text-center">
            <h3 className="text-3xl font-bold brand-font text-slate-800 mb-2">"{currentStory.title}"</h3>
            <p className="text-slate-500">Uma linda aventura em 3 partes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {currentStory.scenes.map((scene, index) => (
              <div key={scene.id} className="group flex flex-col gap-4 animate-in slide-in-from-bottom-8 fade-in duration-700" style={{ animationDelay: `${index * 200}ms` }}>
                <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-square bg-white p-2">
                  <div className="absolute top-4 left-4 z-10 w-10 h-10 bg-amber-400 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg ring-4 ring-white">
                    {index + 1}
                  </div>
                  <img src={scene.image} alt={scene.description} className="w-full h-full object-cover rounded-2xl" />
                  <a
                    href={scene.image}
                    download={`cena-${index + 1}.png`}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <Download className="text-white" size={40} />
                  </a>
                </div>
                <div className="bg-white/60 p-4 rounded-2xl border border-white/80 shadow-sm text-center">
                  <p className="font-bold text-slate-800">{scene.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <button
              className="flex items-center gap-2 px-10 py-5 bg-green-500 text-white rounded-3xl font-bold text-xl shadow-xl shadow-green-100 hover:bg-green-600 transition-all transform hover:-translate-y-1"
              onClick={() => window.print()}
            >
              <CheckCircle2 />
              História Pronta para Imprimir!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryMode;
