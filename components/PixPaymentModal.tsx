
import React from 'react';
import { QrCode, Copy, Check, X } from 'lucide-react';
import { PixData } from '../types';

interface PixPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    pixData: PixData;
}

const PixPaymentModal: React.FC<PixPaymentModalProps> = ({ isOpen, onClose, pixData }) => {
    const [copied, setCopied] = React.useState(false);

    if (!isOpen) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(pixData.brCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="relative p-8 flex flex-col items-center">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                    >
                        <X size={24} />
                    </button>

                    <div className="bg-emerald-100 p-4 rounded-3xl mb-6">
                        <QrCode className="text-emerald-600" size={32} />
                    </div>

                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Pagamento via PIX</h3>
                    <p className="text-slate-500 text-center mb-8">
                        Escaneie o QR Code abaixo ou copie o código para pagar no seu banco.
                    </p>

                    <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 mb-8 w-full flex justify-center">
                        {pixData.brCodeBase64 ? (
                            <img
                                src={pixData.brCodeBase64}
                                alt="QR Code PIX"
                                className="w-48 h-48 object-contain"
                            />
                        ) : (
                            <div className="w-48 h-48 flex items-center justify-center text-slate-400">
                                Gerando QR Code...
                            </div>
                        )}
                    </div>

                    <div className="w-full space-y-4">
                        <div className="relative">
                            <input
                                type="text"
                                readOnly
                                value={pixData.brCode}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-5 pr-14 text-sm text-slate-600 font-mono truncate"
                            />
                            <button
                                onClick={handleCopy}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white text-emerald-600 border border-slate-100 rounded-xl hover:bg-emerald-50 transition-all shadow-sm"
                            >
                                {copied ? <Check size={20} /> : <Copy size={20} />}
                            </button>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg hover:bg-emerald-700 active:scale-95 transition-all shadow-lg shadow-emerald-200"
                        >
                            Já realizei o pagamento
                        </button>
                    </div>

                    <p className="mt-6 text-xs text-slate-400 text-center">
                        O processamento do PIX é instantâneo. <br />
                        Seus créditos aparecerão assim que confirmarmos o recebimento.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PixPaymentModal;
