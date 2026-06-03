'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Search, SlidersHorizontal, UserCircle, Map as MapIcon } from 'lucide-react';
import Link from 'next/link';
import PropertyCard from '@/components/PropertyCard';
import ThemeToggle from '@/components/ThemeToggle';
import PropertySidebar from '@/components/PropertySidebar';
import { PropertyListSkeleton } from '@/components/PropertySkeleton';
import FilterDrawer from '@/components/FilterDrawer';
import { FadeInItem } from '@/components/PageTransition';
import { Property } from '@/types/property';
import { useFilterStore } from '@/store/useFilterStore';
import { toast } from 'sonner';

// Map needs to be client-side only because Leaflet uses window object
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-400">
      <div className="animate-pulse flex flex-col items-center">
        <MapIcon size={48} className="mb-4 opacity-50" />
        <p>Carregando mapa premium...</p>
      </div>
    </div>
  )
});

export default function Home() {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [polygonFilteredIds, setPolygonFilteredIds] = useState<string[] | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { filters, hasActiveFilters, setDrawerOpen } = useFilterStore();

  // Fetch properties from the API (full-stack integration)
  useEffect(() => {
    setIsLoading(true);
    fetch('/api/properties')
      .then(res => {
        if (!res.ok) throw new Error('Falha ao carregar imóveis.');
        return res.json();
      })
      .then((data: Property[]) => {
        setProperties(data);
        setError(null);
      })
      .catch(err => {
        console.error(err);
        setError('Não foi possível carregar os imóveis. Tente novamente.');
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Reactive client-side filter engine
  const filteredProperties = properties.filter(p => {
    if (p.price < filters.minPrice || p.price > filters.maxPrice) return false;
    if (filters.minBedrooms > 0 && p.bedrooms < filters.minBedrooms) return false;
    if (filters.petFriendly !== null && p.petFriendly !== filters.petFriendly) return false;
    if (filters.furnished !== null && p.furnished !== filters.furnished) return false;
    if (filters.city !== null && p.city !== filters.city) return false;
    return true;
  });

  const propertiesToDisplay = polygonFilteredIds
    ? filteredProperties.filter(p => polygonFilteredIds.includes(p.id))
    : filteredProperties;

  // Toast when polygon filter is applied
  const handlePolygonFilter = (ids: string[] | null) => {
    setPolygonFilteredIds(ids);
    if (ids !== null) {
      toast.info(`Área selecionada`, { description: `${ids.length} imóve${ids.length === 1 ? 'l' : 'is'} encontrado${ids.length === 1 ? '' : 's'} na área.` });
    } else {
      toast.success('Seleção removida', { description: 'Exibindo todos os imóveis no mapa.' });
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white dark:bg-black">
      {/* Header */}
      <header className="h-16 border-b border-gray-200 dark:border-white/10 flex items-center justify-between px-6 bg-white dark:bg-black z-10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <span className="text-white font-bold text-lg leading-none">A</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight">Aluga <span className="text-primary">AI</span></h1>
        </div>
        
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full flex items-center">
            <Search className="absolute left-3 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Onde você quer morar?" 
              className="w-full bg-gray-100 dark:bg-white/5 border-transparent outline-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-white/10 transition-all text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/auth/login" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
            <UserCircle size={24} className="text-gray-600 dark:text-gray-300" />
          </Link>
        </div>
      </header>

      {/* Main Split Layout */}
      <main className="flex flex-1 flex-col md:flex-row overflow-hidden">
        
        {/* Left Panel: Filters & Property List */}
        <section className="w-full md:w-1/2 lg:w-[600px] h-full flex flex-col bg-gray-50 dark:bg-[#0a0a0a] border-r border-gray-200 dark:border-white/5 z-10 shrink-0">
          
          {/* Filters Bar */}
          <div className="p-4 border-b border-gray-200 dark:border-white/5 bg-white dark:bg-black/50 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center justify-between">
              <p className="font-medium text-sm text-gray-600 dark:text-gray-300">
                {isLoading ? (
                  <span className="inline-block h-4 w-28 bg-gray-200 dark:bg-white/10 rounded-full animate-pulse" />
                ) : (
                  <>
                    <span className="text-gray-900 dark:text-white font-bold">{propertiesToDisplay.length}</span>
                    {' '}imóveis {polygonFilteredIds ? 'na área desenhada' : 'encontrados'}
                  </>
                )}
              </p>
              <button 
                onClick={() => setDrawerOpen(true)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-700 dark:text-gray-200 ${
                  hasActiveFilters 
                    ? 'border-primary text-primary bg-primary/5' 
                    : 'border-gray-200 dark:border-white/10'
                }`}>
                <SlidersHorizontal size={16} />
                <span>Filtros IA{hasActiveFilters ? ' •' : ''}</span>
              </button>
            </div>
            {/* Quick Chips */}
            <div className="flex gap-2 mt-4 overflow-x-auto pb-1 no-scrollbar">
              {['Aceita Pet', 'Sem Fiador', 'Mobiliado', 'Perto do Centro'].map(chip => (
                <button key={chip} className="whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-primary dark:hover:border-primary text-gray-600 dark:text-gray-300 transition-colors">
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {isLoading ? (
              <PropertyListSkeleton count={3} />
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-4xl mb-4">😕</div>
                <p className="font-semibold text-gray-700 dark:text-gray-200">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 px-5 py-2 bg-primary text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  Tentar novamente
                </button>
              </div>
            ) : propertiesToDisplay.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-4xl mb-4">🗺️</div>
                <p className="font-semibold text-gray-700 dark:text-gray-200">Nenhum imóvel nesta área</p>
                <p className="text-sm text-gray-500 mt-1">Apague o desenho no mapa e tente outra região.</p>
              </div>
            ) : (
              <>
                {propertiesToDisplay.map((property, index) => (
                  <FadeInItem key={property.id} index={index}>
                    <PropertyCard 
                      property={property as any}
                      onClick={() => setSelectedPropertyId(property.id)} 
                    />
                  </FadeInItem>
                ))}
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">
                    Mostrando {propertiesToDisplay.length} imóveis do banco de dados.{' '}
                    <a href="#" className="text-primary hover:underline">Ampliar busca?</a>
                  </p>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Right Panel: Map */}
        <section className="hidden md:block flex-1 h-full relative z-0">
          <MapComponent 
            properties={filteredProperties}
            onPropertySelect={setSelectedPropertyId} 
            onPolygonFilter={handlePolygonFilter}
          />
          
          {/* Floating status pill on map */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] bg-white/90 dark:bg-black/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-black/5 dark:border-white/10 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-green-500 animate-pulse'}`} />
            <span className="text-xs font-medium dark:text-gray-200 text-gray-800">
              {isLoading ? 'Carregando imóveis...' : polygonFilteredIds ? `${propertiesToDisplay.length} imóveis na área` : 'Buscando nesta área'}
            </span>
          </div>
        </section>

      </main>

      {/* Mobile Floating Action Button (Toggle Map/List) */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <button className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-black px-6 py-3 rounded-full shadow-2xl font-medium text-sm">
          <MapIcon size={18} />
          <span>Ver Mapa</span>
        </button>
      </div>

      {/* Filter Drawer */}
      <FilterDrawer />

      {/* Slide-over Sidebar for Property Details */}
      <PropertySidebar 
        propertyId={selectedPropertyId} 
        onClose={() => setSelectedPropertyId(null)} 
      />

    </div>
  );
}
