import React from 'react';
import { GeneratedImage } from '../types';
import { Download } from 'lucide-react';

interface ImageDisplayProps {
  image: GeneratedImage | null;
  isLoading: boolean;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ image, isLoading }) => {
  if (isLoading) {
    return (
      <div className="w-full aspect-square max-w-lg mx-auto rounded-3xl glass-panel flex flex-col items-center justify-center p-8 shadow-xl animate-pulse">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <span className="text-4xl">🎨</span>
        </div>
        <p className="text-amber-600 font-bold brand-font text-2xl mb-2">Pintando sua história...</p>
        <p className="text-slate-500 text-base">Só um momentinho, estamos caprichando!</p>
      </div>
    );
  }

  if (!image) {
    return (
      <div className="w-full aspect-square max-w-lg mx-auto rounded-3xl glass-panel flex flex-col items-center justify-center p-8 shadow-md border-4 border-dashed border-amber-100/80 bg-white/40">
        <div className="bg-white p-6 rounded-full mb-4 shadow-sm">
          <svg className="w-16 h-16 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-slate-500 text-center font-medium text-lg">
          Sua arte mágica vai aparecer aqui.<br/>
          <span className="text-sm opacity-70">Escreva uma historinha lá em cima!</span>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-5 animate-in fade-in zoom-in duration-700 slide-in-from-bottom-4">
      <div className="relative group rounded-3xl overflow-hidden shadow-2xl glass-panel p-2 bg-white">
        <img 
          src={image.url} 
          alt={image.prompt} 
          className="w-full h-auto object-cover rounded-2xl"
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 rounded-3xl">
          <a 
            href={image.url} 
            download={`genesis-kids-${Date.now()}.png`}
            className="flex items-center gap-2 px-6 py-3 bg-white text-amber-600 rounded-full font-bold shadow-lg transform hover:scale-105 transition-all hover:bg-amber-50"
            title="Salvar imagem"
          >
            <Download size={20} />
            <span>Salvar</span>
          </a>
        </div>
      </div>
      <div className="text-center px-4">
        <p className="text-lg text-slate-600 font-medium italic bg-white/50 inline-block px-4 py-2 rounded-xl">
          "{image.prompt}"
        </p>
      </div>
    </div>
  );
};

export default ImageDisplay;