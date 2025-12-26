
import React, { useState, useRef, useMemo } from 'react';
import { LayoutTemplate, Upload, Download, FileText, Palette, Image as ImageIcon, Grid3X3, Maximize, Scissors } from 'lucide-react';
import { GeneratedImage } from '../types';

interface PosterModeProps {
  gallery: GeneratedImage[];
}

const PosterMode: React.FC<PosterModeProps> = ({ gallery }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [verse, setVerse] = useState('');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [grid, setGrid] = useState({ rows: 1, cols: 1 });
  const [overlap, setOverlap] = useState(10); // Margem de sobreposição em mm
  const [borderStyle, setBorderStyle] = useState<'none' | 'stars' | 'clouds' | 'nature'>('stars');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  const posterRef = useRef<HTMLDivElement>(null);

  // Dimensões A4 em mm
  const A4_W = orientation === 'portrait' ? 210 : 297;
  const A4_H = orientation === 'portrait' ? 297 : 210;

  const totalDimensions = useMemo(() => {
    return {
      width: (grid.cols * A4_W) / 10, // em cm
      height: (grid.rows * A4_H) / 10 // em cm
    };
  }, [grid, orientation, A4_W, A4_H]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadPdf = async () => {
    if (!posterRef.current || !selectedImage) return;
    setIsGeneratingPdf(true);
    
    try {
      const { jsPDF } = (window as any).jspdf;
      const html2canvas = (window as any).html2canvas;

      // Captura o pôster inteiro em alta resolução
      const canvas = await html2canvas(posterRef.current, {
        scale: 3, // Alta qualidade para impressão
        useCORS: true,
        backgroundColor: '#ffffff',
        // Ignora elementos com o atributo data-html2canvas-ignore
        ignoreElements: (element: HTMLElement) => {
          return element.hasAttribute('data-html2canvas-ignore');
        }
      });
      
      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: 'a4'
      });

      const canvasW = canvas.width;
      const canvasH = canvas.height;
      
      // Tamanho de cada "pedaço" base sem overlap
      const baseChunkW = canvasW / grid.cols;
      const baseChunkH = canvasH / grid.rows;

      // Converter overlap de mm para pixels
      const mmToPxW = canvasW / (grid.cols * A4_W);
      const mmToPxH = canvasH / (grid.rows * A4_H);
      const overlapPxW = overlap * mmToPxW;
      const overlapPxH = overlap * mmToPxH;

      for (let r = 0; r < grid.rows; r++) {
        for (let c = 0; c < grid.cols; c++) {
          if (r > 0 || c > 0) pdf.addPage();

          let sx = c * baseChunkW;
          let sy = r * baseChunkH;
          let sw = baseChunkW;
          let sh = baseChunkH;

          if (c > 0) {
            sx -= overlapPxW;
            sw += overlapPxW;
          }
          if (c < grid.cols - 1) {
            sw += overlapPxW;
          }
          if (r > 0) {
            sy -= overlapPxH;
            sh += overlapPxH;
          }
          if (r < grid.rows - 1) {
            sh += overlapPxH;
          }

          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = sw;
          tempCanvas.height = sh;
          const ctx = tempCanvas.getContext('2d');
          
          if (ctx) {
            ctx.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);
            const chunkData = tempCanvas.toDataURL('image/png');
            
            const pdfDrawW = (sw / baseChunkW) * A4_W;
            const pdfDrawH = (sh / baseChunkH) * A4_H;
            
            const offsetX = c > 0 ? -overlap : 0;
            const offsetY = r > 0 ? -overlap : 0;

            pdf.addImage(chunkData, 'PNG', offsetX, offsetY, pdfDrawW, pdfDrawH);
            
            if (overlap > 0) {
              pdf.setDrawColor(200, 200, 200);
              pdf.setLineDashPattern([2, 2], 0);
              if (c < grid.cols - 1) {
                pdf.line(A4_W, 0, A4_W, A4_H);
              }
              if (r < grid.rows - 1) {
                pdf.line(0, A4_H, A4_W, A4_H);
              }
            }
          }
        }
      }
      
      pdf.save(`poster-mosaico-genesis-${grid.cols}x${grid.rows}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao processar o PDF. Tente uma grade menor.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const borderStyles = {
    none: "",
    stars: "border-[12px] border-amber-100 ring-[4px] ring-white ring-inset",
    clouds: "border-[12px] border-blue-50 ring-[4px] ring-white ring-inset",
    nature: "border-[12px] border-green-50 ring-[4px] ring-white ring-inset"
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in fade-in duration-500">
      
      {/* Settings Panel */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="glass-panel p-6 shadow-xl">
          <h2 className="text-2xl font-bold brand-font text-slate-800 mb-6 flex items-center gap-2">
            <Palette className="text-amber-500" />
            Editor de Pôster Gigante
          </h2>

          <div className="space-y-6">
            {/* Image Selection */}
            <section>
              <label className="block font-bold text-slate-600 mb-3 text-sm uppercase">1. Selecionar Arte</label>
              <div className="grid grid-cols-4 gap-2 mb-4 max-h-40 overflow-y-auto p-2 bg-white rounded-2xl border border-slate-100">
                {gallery.length > 0 ? gallery.map(img => (
                  <button 
                    key={img.id}
                    onClick={() => setSelectedImage(img.url)}
                    className={`aspect-square rounded-lg overflow-hidden border-4 transition-all ${selectedImage === img.url ? 'border-amber-400 scale-95' : 'border-transparent hover:border-amber-200'}`}
                  >
                    <img src={img.url} className="w-full h-full object-cover" alt="Galeria" />
                  </button>
                )) : (
                  <div className="col-span-4 py-6 text-center text-slate-400 text-xs italic">
                    Gere uma arte bíblica para começar!
                  </div>
                )}
              </div>
              
              <label className="relative flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-amber-200 rounded-xl cursor-pointer hover:bg-amber-50 bg-white transition-colors text-sm">
                <Upload size={16} className="text-amber-400" />
                <span className="font-bold text-amber-600">Usar minha própria foto</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </section>

            {/* Grid & Overlap Selection */}
            <section className="bg-white p-4 rounded-2xl border border-amber-100 space-y-4 shadow-sm">
              <label className="flex items-center gap-2 font-bold text-slate-700 text-sm uppercase">
                <Grid3X3 size={18} className="text-amber-500" />
                2. Formato do Painel
              </label>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Colunas (A4)</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="range" min="1" max="5" step="1" 
                      value={grid.cols} 
                      onChange={e => setGrid({...grid, cols: parseInt(e.target.value)})}
                      className="flex-1 accent-amber-500"
                    />
                    <span className="font-bold text-amber-700 min-w-[20px]">{grid.cols}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Linhas (A4)</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="range" min="1" max="5" step="1" 
                      value={grid.rows} 
                      onChange={e => setGrid({...grid, rows: parseInt(e.target.value)})}
                      className="flex-1 accent-amber-500"
                    />
                    <span className="font-bold text-amber-700 min-w-[20px]">{grid.rows}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1 uppercase">
                  <Scissors size={14} className="text-slate-400" />
                  Margem de Colagem (Overlap): {overlap}mm
                </label>
                <input 
                  type="range" min="0" max="30" step="5" 
                  value={overlap} 
                  onChange={e => setOverlap(parseInt(e.target.value))}
                  className="w-full accent-slate-400"
                />
                <p className="text-[10px] text-slate-400 italic">Ajuda a encaixar as folhas sem deixar frestas brancas.</p>
              </div>

              <div className="mt-2 pt-3 border-t border-amber-200/50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600">
                  <Maximize size={16} />
                  <span className="text-xs font-bold uppercase">Tamanho Final:</span>
                </div>
                <span className="bg-slate-50 px-3 py-1 rounded-lg text-amber-700 font-black shadow-sm text-sm border border-amber-50">
                  {totalDimensions.width.toFixed(1)} x {totalDimensions.height.toFixed(1)} cm
                </span>
              </div>
            </section>

            {/* Style and Message */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-600 mb-2 text-xs uppercase">Papel</label>
                <select 
                  value={orientation} 
                  onChange={(e: any) => setOrientation(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl font-bold border-2 border-slate-100 text-sm outline-none focus:border-amber-400 bg-white text-slate-700 cursor-pointer"
                >
                  <option value="portrait">Vertical</option>
                  <option value="landscape">Horizontal</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-2 text-xs uppercase">Moldura</label>
                <select 
                  value={borderStyle} 
                  onChange={(e: any) => setBorderStyle(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl font-bold border-2 border-slate-100 text-sm outline-none focus:border-amber-400 bg-white text-slate-700 cursor-pointer"
                >
                  <option value="none">Limpo</option>
                  <option value="stars">Estrelas</option>
                  <option value="clouds">Nuvens</option>
                  <option value="nature">Natureza</option>
                </select>
              </div>
            </div>

            <section>
              <input 
                type="text" 
                placeholder="Título do Pôster" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full p-3 mb-2 rounded-xl border-2 border-slate-100 text-sm focus:border-amber-400 outline-none bg-white text-slate-700"
              />
              <textarea 
                placeholder="Versículo ou Mensagem Especial..." 
                value={verse}
                onChange={e => setVerse(e.target.value)}
                className="w-full p-3 rounded-xl border-2 border-slate-100 text-sm focus:border-amber-400 outline-none h-16 resize-none bg-white text-slate-700"
              />
            </section>

            <button
              onClick={handleDownloadPdf}
              disabled={!selectedImage || isGeneratingPdf}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-green-100 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all"
            >
              {isGeneratingPdf ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin text-xl">✨</span> Fatiando em {grid.rows * grid.cols} folhas...
                </span>
              ) : (
                <>
                  <FileText size={24} /> Gerar PDF do Painel
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="lg:col-span-7 flex flex-col items-center">
        <div className="sticky top-8 w-full flex flex-col items-center">
          <h3 className="text-xl font-bold brand-font text-slate-400 mb-4 uppercase tracking-widest text-sm">Mapa de Montagem</h3>
          
          <div className="relative w-full max-w-2xl bg-white p-8 rounded-[2.5rem] shadow-inner overflow-hidden border-4 border-slate-100">
            <div 
              ref={posterRef}
              className={`bg-white shadow-2xl mx-auto relative overflow-hidden transition-all duration-500 ${borderStyles[borderStyle]}`}
              style={{
                aspectRatio: `${grid.cols * A4_W} / ${grid.rows * A4_H}`,
                width: '100%'
              }}
            >
              {selectedImage ? (
                <>
                  <div className="absolute inset-0 z-0">
                    <img src={selectedImage} className="w-full h-full object-cover" alt="Poster Content" />
                  </div>
                  
                  {/* Grid Lines Overlay with Overlap visualization */}
                  {/* O atributo data-html2canvas-ignore fará com que o html2canvas pule este elemento */}
                  <div 
                    className="absolute inset-0 z-20 pointer-events-none" 
                    data-html2canvas-ignore="true"
                  >
                    <div className="w-full h-full grid" style={{
                      gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
                      gridTemplateRows: `repeat(${grid.rows}, 1fr)`
                    }}>
                      {Array.from({ length: grid.rows * grid.cols }).map((_, i) => (
                        <div key={i} className="border border-white/40 border-dashed relative bg-black/5 flex items-center justify-center">
                           <div className="text-[min(2vw,14px)] font-bold text-white/40 uppercase">Folha {i+1}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Text Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-[6%] z-10 bg-gradient-to-t from-black/80 via-black/20 to-transparent text-white text-center">
                    {title && <h1 className="text-[min(4vw,2.2rem)] font-bold brand-font mb-2 drop-shadow-2xl">{title}</h1>}
                    {verse && <p className="text-[min(2vw,1.1rem)] font-medium italic opacity-95 leading-relaxed drop-shadow-lg max-w-[85%] mx-auto">{verse}</p>}
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-4 bg-slate-50">
                  <ImageIcon size={64} />
                  <p className="font-bold">Aguardando sua arte...</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-3 gap-4 w-full max-w-xl">
            <div className="bg-white/90 p-3 rounded-2xl text-center shadow-sm border border-amber-100">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Folhas</div>
              <div className="text-xl font-black text-amber-600">{grid.rows * grid.cols}</div>
            </div>
            <div className="bg-white/90 p-3 rounded-2xl text-center shadow-sm border border-amber-100">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Tamanho</div>
              <div className="text-xl font-black text-amber-600">{(totalDimensions.width).toFixed(0)}x{(totalDimensions.height).toFixed(0)}cm</div>
            </div>
            <div className="bg-white/90 p-3 rounded-2xl text-center shadow-sm border border-amber-100">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Sobreposição</div>
              <div className="text-xl font-black text-amber-600">{overlap}mm</div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl max-w-md">
            <p className="text-[11px] text-blue-600 font-medium leading-tight">
              <strong>Dica de Mestre:</strong> Ao imprimir, o PDF terá {grid.rows * grid.cols} páginas. 
              As áreas de {overlap}mm se repetem entre as folhas para que você possa colar uma sobre a outra, 
              garantindo que o desenho fique perfeito e sem frestas brancas!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PosterMode;
