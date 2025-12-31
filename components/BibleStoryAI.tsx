import React, { useState } from 'react';
import { BookOpen, Wand2, Copy, Download, CheckCircle2, Coins, FileText } from 'lucide-react';
import { BibleStory, User } from '../types';
import { generateFullBibleStory } from '../services/geminiService';

interface BibleStoryAIProps {
    user: User | null;
    onDeductCredits: (amount: number) => Promise<boolean>;
    onStartLoading: () => void;
    onEndLoading: (error?: string) => void;
    isLoading: boolean;
}

const ageRanges = [
    { id: '1-3', label: '1 - 3 anos' },
    { id: '3-5', label: '3 - 5 anos' },
    { id: '5-8', label: '5 - 8 anos' },
    { id: '8-10', label: '8 - 10 anos' },
    { id: '10-13', label: '10 - 13 anos' },
    { id: '13-15', label: '13 - 15 anos' },
];

const BibleStoryAI: React.FC<BibleStoryAIProps> = ({ user, onDeductCredits, onStartLoading, onEndLoading, isLoading }) => {
    const [topic, setTopic] = useState('');
    const [selectedAge, setSelectedAge] = useState('5-8');
    const [currentStory, setCurrentStory] = useState<BibleStory | null>(null);
    const [copied, setCopied] = useState(false);

    const handleCreateStory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim() || isLoading) return;

        // Custo de 1 crédito para gerar o texto da história
        if (!(await onDeductCredits(1))) return;

        onStartLoading();
        setCurrentStory(null);
        setCopied(false);

        try {
            const content = await generateFullBibleStory(topic, selectedAge);

            setCurrentStory({
                id: Date.now().toString(),
                title: topic,
                content: content,
                ageRange: selectedAge,
                createdAt: Date.now()
            });
            onEndLoading();
        } catch (err: any) {
            console.error(err);
            onEndLoading("Erro ao criar história. Verifique sua conexão ou tente novamente.");
        }
    };

    const handleCopyText = () => {
        if (currentStory) {
            navigator.clipboard.writeText(currentStory.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDownloadPDF = () => {
        if (!currentStory) return;

        // Simple approach: using window.print() but could be improved with jsPDF if needed
        // For now, we'll provide a clean printable view
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
        <html>
          <head>
            <title>${currentStory.title}</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; line-height: 1.6; color: #333; }
              h1 { color: #f59e0b; text-align: center; }
              p { margin-bottom: 20px; font-size: 1.2rem; white-space: pre-wrap; }
              .footer { margin-top: 50px; text-align: center; font-size: 0.9rem; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
            </style>
          </head>
          <body>
            <h1>${currentStory.title}</h1>
            <p>${currentStory.content}</p>
            <div class="footer">Gerado por Genesis Kids - Histórias Bíblicas com IA</div>
          </body>
        </html>
      `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto px-4 animate-in fade-in duration-500">
            <div className="glass-panel p-8 mb-8 border-amber-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h2 className="text-2xl font-bold brand-font text-slate-800 flex items-center gap-2">
                        <FileText className="text-amber-500" />
                        Criador de Histórias com IA
                    </h2>
                    <div className="flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full font-black text-sm uppercase">
                        <Coins size={16} /> Custo: 1 crédito
                    </div>
                </div>

                <form onSubmit={handleCreateStory} className="space-y-6">
                    <div className="flex flex-col gap-2">
                        <label className="font-bold text-slate-600 ml-2">Sobre o que será a história?</label>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Ex: A coragem de Davi contra o gigante Golias..."
                            className="w-full p-5 rounded-3xl bg-white border-2 border-amber-50 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 outline-none transition-all text-lg shadow-inner text-slate-700"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="glass-panel p-4 rounded-3xl border-amber-100/50">
                        <div className="flex items-center gap-2 mb-3 text-slate-600 px-2">
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

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={!topic.trim() || isLoading}
                            className="px-8 py-4 bg-gradient-to-r from-orange-400 to-amber-400 text-white rounded-2xl font-bold text-lg flex items-center gap-3 shadow-lg shadow-amber-200 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all"
                        >
                            {isLoading ? 'Escrevendo...' : 'Gerar História'}
                            <Wand2 size={24} />
                        </button>
                    </div>
                </form>
            </div>

            {currentStory && (
                <div className="space-y-8 pb-12 animate-in slide-in-from-bottom-8 duration-700">
                    <div className="glass-panel p-8 md:p-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/30 rounded-bl-full -mr-16 -mt-16"></div>

                        <h3 className="text-3xl font-bold brand-font text-slate-800 mb-8 border-b-2 border-amber-100 pb-4">
                            {currentStory.title}
                        </h3>

                        <div className="prose prose-amber max-w-none text-slate-700 leading-relaxed text-lg whitespace-pre-wrap">
                            {currentStory.content}
                        </div>

                        <div className="mt-12 pt-8 border-t border-amber-100 flex flex-wrap gap-4 justify-center sm:justify-between items-center">
                            <div className="flex gap-3">
                                <button
                                    onClick={handleCopyText}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${copied ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                                    {copied ? 'Copiado!' : 'Copiar Texto'}
                                </button>

                                <button
                                    onClick={handleDownloadPDF}
                                    className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-2xl font-bold transition-all"
                                >
                                    <Download size={20} />
                                    Baixar em PDF
                                </button>
                            </div>

                            <div className="text-slate-400 text-sm italic">
                                História personalizada para {ageRanges.find(r => r.id === currentStory.ageRange)?.label}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <div className="bg-amber-50 border border-amber-200 px-6 py-4 rounded-3xl flex items-center gap-3 text-amber-800">
                            <BookOpen className="text-amber-500" />
                            <span className="font-medium">Que tal gerar uma imagem para acompanhar esta história na aba "Criar"?</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BibleStoryAI;
