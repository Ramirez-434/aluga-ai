'use client';
import { useFilterStore } from '@/store/useFilterStore';
import { X, SlidersHorizontal, RotateCcw, Check } from 'lucide-react';

const CITIES = ['Todas', 'Gurupi', 'Natividade'];

function ToggleButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 ${
        active
          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/30'
          : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-indigo-300'
      }`}
    >
      {children}
    </button>
  );
}

function BedroomCounter({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const options = [0, 1, 2, 3, 4];
  return (
    <div className="flex gap-2">
      {options.map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className={`w-11 h-11 rounded-xl text-sm font-bold border transition-all duration-200 ${
            value === n
              ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/30'
              : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-indigo-300'
          }`}
        >
          {n === 0 ? 'Todos' : `${n}+`}
        </button>
      ))}
    </div>
  );
}

export default function FilterDrawer() {
  const { filters, isDrawerOpen, hasActiveFilters, setFilter, resetFilters, setDrawerOpen } =
    useFilterStore();

  return (
    <>
      {/* H65: Bottom Sheet no mobile, Slide-over no desktop */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[550]"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Mobile: Bottom Sheet | Desktop: Right Panel */}
      <aside
        className={`
          fixed z-[560] bg-white dark:bg-[#111] flex flex-col
          shadow-2xl transition-all duration-300 ease-in-out
          
          /* Mobile: Bottom Sheet */
          bottom-0 left-0 right-0 rounded-t-3xl max-h-[90vh]
          border-t border-gray-200 dark:border-white/10
          md:bottom-auto md:top-0 md:right-0 md:left-auto
          md:h-full md:w-80 md:max-h-none md:rounded-none
          md:border-t-0 md:border-l md:rounded-l-none
          
          ${isDrawerOpen
            ? 'translate-y-0 md:translate-y-0 md:translate-x-0'
            : 'translate-y-full md:translate-y-0 md:translate-x-full'
          }
        `}
      >
        {/* H65: Handle bar visual para Bottom Sheet no mobile */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 bg-gray-300 dark:bg-white/20 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/8 shrink-0">
          <div className="flex items-center gap-3">
            <SlidersHorizontal size={19} className="text-indigo-500" />
            <h2 className="text-base font-black text-gray-900 dark:text-white">Filtros</h2>
            {hasActiveFilters && (
              <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-black rounded-full tracking-wide">
                ATIVO
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-500 transition-colors px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                <RotateCcw size={13} />
                Limpar
              </button>
            )}
            <button
              onClick={() => setDrawerOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            >
              <X size={19} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-8">

          {/* City Filter */}
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">
              Cidade
            </label>
            <div className="flex gap-2 flex-wrap">
              {CITIES.map((city) => {
                const val = city === 'Todas' ? null : city;
                return (
                  <button
                    key={city}
                    onClick={() => setFilter('city', val)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                      filters.city === val
                        ? 'bg-primary border-primary text-white shadow-md shadow-primary/30'
                        : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-primary/50'
                    }`}
                  >
                    {city}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                Faixa de Preço
              </label>
              <span className="text-sm font-bold text-primary">
                R$ {filters.minPrice.toLocaleString('pt-BR')} — R$ {filters.maxPrice.toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Mínimo</span>
                  <span>R$ {filters.minPrice.toLocaleString('pt-BR')}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10000}
                  step={100}
                  value={filters.minPrice}
                  onChange={(e) => setFilter('minPrice', Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-primary"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Máximo</span>
                  <span>R$ {filters.maxPrice.toLocaleString('pt-BR')}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10000}
                  step={100}
                  value={filters.maxPrice}
                  onChange={(e) => setFilter('maxPrice', Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>
          </div>

          {/* Bedrooms */}
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">
              Mínimo de Quartos
            </label>
            <BedroomCounter
              value={filters.minBedrooms}
              onChange={(v) => setFilter('minBedrooms', v)}
            />
          </div>

          {/* Pet Friendly */}
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">
              Aceita Pets?
            </label>
            <div className="flex gap-3">
              <ToggleButton
                active={filters.petFriendly === null}
                onClick={() => setFilter('petFriendly', null)}
              >
                Indiferente
              </ToggleButton>
              <ToggleButton
                active={filters.petFriendly === true}
                onClick={() => setFilter('petFriendly', true)}
              >
                🐾 Sim
              </ToggleButton>
              <ToggleButton
                active={filters.petFriendly === false}
                onClick={() => setFilter('petFriendly', false)}
              >
                Não
              </ToggleButton>
            </div>
          </div>

          {/* Furnished */}
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">
              Mobiliado?
            </label>
            <div className="flex gap-3">
              <ToggleButton
                active={filters.furnished === null}
                onClick={() => setFilter('furnished', null)}
              >
                Indiferente
              </ToggleButton>
              <ToggleButton
                active={filters.furnished === true}
                onClick={() => setFilter('furnished', true)}
              >
                🛋️ Sim
              </ToggleButton>
              <ToggleButton
                active={filters.furnished === false}
                onClick={() => setFilter('furnished', false)}
              >
                Não
              </ToggleButton>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="p-5 border-t border-gray-100 dark:border-white/8 shrink-0">
          <button
            onClick={() => setDrawerOpen(false)}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/30"
          >
            <Check size={18} />
            Aplicar Filtros
          </button>
        </div>
      </aside>
    </>
  );
}
