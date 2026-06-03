'use client';
import { useFilterStore } from '@/store/useFilterStore';
import { X, SlidersHorizontal, RotateCcw, Check } from 'lucide-react';

const CITIES = ['Todas', 'Gurupi', 'Natividade'];

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 ${
        active
          ? 'bg-primary border-primary text-white shadow-md shadow-primary/30'
          : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-primary/50'
      }`}
    >
      {children}
    </button>
  );
}

function BedroomCounter({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const options = [0, 1, 2, 3, 4];
  return (
    <div className="flex gap-2">
      {options.map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className={`w-11 h-11 rounded-xl text-sm font-bold border transition-all duration-200 ${
            value === n
              ? 'bg-primary border-primary text-white shadow-md shadow-primary/30'
              : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-primary/50'
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
      {/* Backdrop */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[550] md:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-[#111] border-l border-gray-200 dark:border-white/10 shadow-2xl z-[560] flex flex-col transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <SlidersHorizontal size={20} className="text-primary" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Filtros</h2>
            {hasActiveFilters && (
              <span className="px-2 py-0.5 bg-primary text-white text-xs font-bold rounded-full">
                Ativos
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
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
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
            >
              <X size={20} className="text-gray-500 dark:text-gray-300" />
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
        <div className="p-5 border-t border-gray-200 dark:border-white/10 shrink-0">
          <button
            onClick={() => setDrawerOpen(false)}
            className="w-full bg-primary hover:bg-blue-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/30"
          >
            <Check size={18} />
            Aplicar Filtros
          </button>
        </div>
      </aside>
    </>
  );
}
