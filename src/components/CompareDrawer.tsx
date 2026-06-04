'use client';
import { useCompareStore } from '@/store/useCompareStore';
import { X, Scale } from 'lucide-react';

export default function CompareDrawer() {
  const { compareList, removeProperty, setModalOpen, clearCompareList } = useCompareStore();

  if (compareList.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#111] border-t border-gray-200 dark:border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-[500] animate-in slide-in-from-bottom-full duration-300">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 w-full overflow-hidden">
          <div className="flex items-center gap-2 text-primary font-bold bg-primary/10 px-4 py-2 rounded-xl shrink-0">
            <Scale size={18} />
            <span>Comparar ({compareList.length}/3)</span>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {compareList.map(prop => (
              <div key={prop.id} className="flex items-center bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-1 pr-3 gap-3 shrink-0 shadow-sm">
                <img src={prop.featuredImage} alt={prop.title} className="w-12 h-12 object-cover rounded-lg" />
                <div className="w-32">
                  <p className="text-[11px] font-bold truncate dark:text-white text-gray-900">{prop.title}</p>
                  <p className="text-xs text-primary font-semibold truncate mt-0.5">R$ {prop.basePrice.toLocaleString('pt-BR')}</p>
                </div>
                <button onClick={() => removeProperty(prop.id)} className="p-1 text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 rounded-md hover:text-red-500 transition-colors">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={clearCompareList} className="text-sm font-semibold text-gray-500 hover:text-red-500 px-4 py-2 transition-colors">
            Limpar
          </button>
          <button 
            onClick={() => setModalOpen(true)}
            disabled={compareList.length < 2}
            className="bg-primary hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/30"
          >
            Ver Comparação
          </button>
        </div>
      </div>
    </div>
  );
}
