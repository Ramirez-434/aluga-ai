'use client';
import { useCompareStore } from '@/store/useCompareStore';
import { X, Check } from 'lucide-react';

export default function CompareModal() {
  const { isModalOpen, setModalOpen, compareList, removeProperty } = useCompareStore();

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[600] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#111] w-full max-w-5xl max-h-full rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="p-6 border-b border-gray-200 dark:border-white/10 flex items-center justify-between bg-gray-50 dark:bg-white/5 shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Comparação de Imóveis</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Analisando {compareList.length} propriedades lado a lado.</p>
          </div>
          <button onClick={() => setModalOpen(false)} className="p-2 bg-gray-200 dark:bg-white/10 rounded-full hover:bg-gray-300 dark:hover:bg-white/20 transition-colors">
            <X size={20} className="text-gray-600 dark:text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 md:p-8">
          <div className="flex gap-6 min-w-max">
            {/* Primeira Coluna: Labels */}
            <div className="w-32 flex flex-col shrink-0 mt-[260px] space-y-4">
              <div className="h-12 flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider">Aluguel</div>
              <div className="h-12 flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider">Área</div>
              <div className="h-12 flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider">Quartos</div>
              <div className="h-12 flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider">Suítes</div>
              <div className="h-12 flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider">Banheiros</div>
              <div className="h-12 flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider">Garagem</div>
            </div>

            {/* Imóveis */}
            {compareList.map(prop => {
              // Valores seguros caso as propriedades não existam no mock original
              const suites = (prop as any).suites || 0;
              const bathrooms = (prop as any).bathrooms || 1;
              const parkingSpots = (prop as any).parkingSpots || 1;

              return (
                <div key={prop.id} className="w-80 flex flex-col shrink-0 bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-white/10 p-5 relative group shadow-sm">
                  <button 
                    onClick={() => removeProperty(prop.id)}
                    className="absolute top-3 right-3 p-1.5 bg-black/40 hover:bg-red-500 text-white rounded-lg backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all z-10"
                    title="Remover da comparação"
                  >
                    <X size={16} />
                  </button>
                  <img src={prop.featuredImage} alt={prop.title} className="w-full h-48 object-cover rounded-xl mb-4" />
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 line-clamp-1">{prop.title}</h3>
                  <p className="text-xs text-gray-500 mb-6 h-8 line-clamp-2">{prop.address}</p>

                  <div className="space-y-4">
                    <div className="h-12 flex items-center border-b border-gray-100 dark:border-white/5 text-2xl font-bold text-primary">
                      R$ {prop.price.toLocaleString('pt-BR')}
                    </div>
                    <div className="h-12 flex items-center border-b border-gray-100 dark:border-white/5 font-semibold text-gray-800 dark:text-gray-200 text-lg">
                      {prop.area} m²
                    </div>
                    <div className="h-12 flex items-center border-b border-gray-100 dark:border-white/5 font-semibold text-gray-800 dark:text-gray-200 text-lg">
                      {prop.bedrooms}
                    </div>
                    <div className="h-12 flex items-center border-b border-gray-100 dark:border-white/5 font-semibold text-gray-800 dark:text-gray-200 text-lg">
                      {suites}
                    </div>
                    <div className="h-12 flex items-center border-b border-gray-100 dark:border-white/5 font-semibold text-gray-800 dark:text-gray-200 text-lg">
                      {bathrooms}
                    </div>
                    <div className="h-12 flex items-center font-semibold text-gray-800 dark:text-gray-200 text-lg">
                      {parkingSpots}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      alert(`Iniciando fluxo de aluguel para: ${prop.title}`);
                      setModalOpen(false);
                    }}
                    className="w-full mt-6 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md"
                  >
                    <Check size={18} />
                    Alugar este
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
