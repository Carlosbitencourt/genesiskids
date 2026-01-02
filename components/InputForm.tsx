
import React, { useState } from 'react';
import { Wand2, Users } from 'lucide-react';

interface InputFormProps {
  onGenerate: (prompt: string, ageRange: string) => void;
  isLoading: boolean;
}

const ageRanges = [
  { id: '0-12m', label: '0 - 12 meses' },
  { id: '1-3', label: '01 - 3 anos' },
  { id: '4-6', label: '04 - 06 anos' },
  { id: '7-9', label: '07 - 09 anos' },
  { id: '10-12', label: '10 - 12 anos' },
  { id: '13-16', label: '13 - 16 anos' },
];

const InputForm: React.FC<InputFormProps> = ({ onGenerate, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedAge, setSelectedAge] = useState<string>('4-6');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onGenerate(prompt.trim(), selectedAge);
    }
  };

  const suggestions = [
    "A Arca de Noé com bichinhos fofos",
    "Pequeno Davi tocando harpa",
    "Jonas e a baleia sorrindo",
    "Anjinhos cantando no céu"
  ];

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 px-4">
      <form onSubmit={handleSubmit} className="relative mb-6">
        {/* Search Bar */}
        <div className="relative group mb-6">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-300 to-pink-300 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: Jesus abraçando as criancinhas..."
            className="relative w-full p-5 pr-36 rounded-full bg-white border-2 border-amber-100 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 outline-none transition-all text-lg placeholder:text-slate-400 text-slate-700 shadow-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isLoading}
            className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white px-6 rounded-full font-bold brand-font flex items-center gap-2 transition-all shadow-md transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="animate-spin text-2xl">🌟</span>
            ) : (
              <>
                <span className="hidden sm:inline text-lg">Criar!</span>
                <Wand2 size={20} />
              </>
            )}
          </button>
        </div>

        {/* Age Selection */}
        <div className="glass-panel p-4 rounded-3xl border-amber-100/50">
          <div className="flex items-center gap-2 mb-3 text-slate-600 px-2">
            <Users size={18} className="text-amber-500" />
            <span className="font-bold text-sm uppercase tracking-wider">Idade das Crianças</span>
          </div>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            {ageRanges.map((range) => (
              <button
                key={range.id}
                type="button"
                onClick={() => setSelectedAge(range.id)}
                disabled={isLoading}
                className={`
                            px-4 py-2 rounded-full text-sm font-bold transition-all transform hover:scale-105 active:scale-95
                            ${selectedAge === range.id
                    ? 'bg-amber-400 text-white shadow-lg shadow-amber-200 scale-105 ring-2 ring-amber-200 ring-offset-2'
                    : 'bg-white text-slate-500 hover:bg-amber-50 border border-slate-100'
                  }
                        `}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </form>

      {/* Suggestions */}
      <div className="flex flex-wrap gap-3 justify-center">
        {suggestions.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setPrompt(s)}
            disabled={isLoading}
            className="text-sm px-4 py-2 bg-white hover:bg-amber-50 border-2 border-amber-100 hover:border-amber-300 rounded-2xl text-slate-600 font-medium transition-all transform hover:-translate-y-0.5 shadow-sm"
          >
            ✨ {s}
          </button>
        ))}
      </div>
    </div>
  );
};

export default InputForm;
