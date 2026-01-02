
import React, { useState, useRef } from 'react';
import { Upload, Wand2, Copy, Download, CheckCircle2, Coins, FileText, RotateCcw, Image as ImageIcon } from 'lucide-react';
import { User, BibleStory } from '../types';
import { summarizeStoryFromImage } from '../services/geminiService';

interface StorySummarizerProps {
    user: User | null;
    onDeductCredits: (amount: number) => Promise<boolean>;
    onStartLoading: () => void;
    onEndLoading: (error?: string) => void;
    isLoading: boolean;
}

const StorySummarizer: React.FC<StorySummarizerProps> = ({ user, onDeductCredits, onStartLoading, onEndLoading, isLoading }) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [summary, setSummary] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
                setSummary(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSummarize = async () => {
        if (!selectedImage || isLoading) return;

        // Custo de 1 crédito para resumir a história
        if (!(await onDeductCredits(1))) return;

        onStartLoading();
        setCopied(false);

        try {
            const result = await summarizeStoryFromImage(selectedImage);
            setSummary(result);
            onEndLoading();
        } catch (err: any) {
            console.error(err);
            onEndLoading("Erro ao resumir história. Verifique o formato da imagem ou tente novamente.");
        }
    };

    const handleCopyText = () => {
        if (summary) {
            navigator.clipboard.writeText(summary);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDownloadPDF = () => {
        if (!summary) return;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
        <html>
          <head>
            <title>Resumo da História</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; line-height: 1.6; color: #333; }
              h1 { color: #f59e0b; text-align: center; }
              p { margin-bottom: 20px; font-size: 1.2rem; white-space: pre-wrap; }
              .footer { margin-top: 50px; text-align: center; font-size: 0.9rem; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
              img { max-width: 100%; height: auto; border-radius: 12px; margin-bottom: 30px; display: block; margin-left: auto; margin-right: auto; }
            </style>
          </head>
          <body>
            <h1>Resumo da História</h1>
            <div style="text-align: center;">
              <img src="${selectedImage}" alt="História" />
            </div>
            <p>${summary}</p>
            <div class="footer">Gerado por Genesis Kids - Resumidor de Histórias com IA</div>
          </body>
        </html>
      `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="w-full max-w-4xl mx-auto px-4 animate-in fade-in duration-500">
            <div className="glass-panel p-8 mb-8 border-amber-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h2 className="text-2xl font-bold brand-font text-slate-800 flex items-center gap-2">
                        <FileText className="text-amber-500" />
                        Resumidor de Histórias
                    </h2>
                    <div className="flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full font-black text-sm uppercase">
                        <Coins size={16} /> Custo: 1 crédito
                    </div>
                </div>

                <div className="space-y-6">
                    <div
                        onClick={triggerFileInput}
                        className={`
                            relative w-full aspect-video sm:aspect-[21/9] rounded-3xl border-4 border-dashed transition-all cursor-pointer overflow-hidden
                            ${selectedImage ? 'border-amber-400' : 'border-amber-100 hover:border-amber-300 bg-amber-50/50'}
                            flex flex-col items-center justify-center gap-4
                        `}
                    >
                        {selectedImage ? (
                            <>
                                <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/20 hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                                    <span className="text-white font-bold bg-black/50 px-6 py-2 rounded-full">Trocar Imagem</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-500">
                                    <Upload size={32} />
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-bold text-slate-700">Clique para anexar uma foto</p>
                                    <p className="text-sm text-slate-500">Arraste uma imagem ou clique para selecionar</p>
                                </div>
                            </>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>

                    <div className="flex justify-center">
                        <button
                            onClick={handleSummarize}
                            disabled={!selectedImage || isLoading}
                            className="px-10 py-4 bg-gradient-to-r from-orange-400 to-amber-400 text-white rounded-2xl font-bold text-lg flex items-center gap-3 shadow-lg shadow-amber-200 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all"
                        >
                            {isLoading ? 'Analisando...' : (summary ? 'Resumir de Novo' : 'Resumir História')}
                            {summary ? <RotateCcw size={24} /> : <Wand2 size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {summary && (
                <div className="space-y-8 pb-12 animate-in slide-in-from-bottom-8 duration-700">
                    <div className="glass-panel p-8 md:p-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/30 rounded-bl-full -mr-16 -mt-16"></div>

                        <h3 className="text-3xl font-bold brand-font text-slate-800 mb-8 border-b-2 border-amber-100 pb-4 flex items-center gap-3">
                            <ImageIcon className="text-amber-500" />
                            Resumo de História
                        </h3>

                        <div className="prose prose-amber max-w-none text-slate-700 leading-relaxed text-lg whitespace-pre-wrap">
                            {summary}
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
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StorySummarizer;
