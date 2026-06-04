'use client';
import { useState, useEffect, useMemo } from 'react';
import { useFilterStore } from '@/store/useFilterStore';
import useSWRInfinite from 'swr/infinite';
import useSWR from 'swr';
import dynamic from 'next/dynamic';
import { SlidersHorizontal, Map as MapIcon } from 'lucide-react';
import PropertyCard from '@/components/PropertyCard';
import Header from '@/components/Header';
import PropertySidebar from '@/components/PropertySidebar';
import { PropertyListSkeleton } from '@/components/PropertySkeleton';
import FilterDrawer from '@/components/FilterDrawer';
import { FadeInItem } from '@/components/PageTransition';
import { Property } from '@/types/property';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'sonner';
import CreateRadarButton from '@/components/CreateRadarButton';
import SplashScreen from '@/components/SplashScreen';
import EmptyStateRadar from '@/components/EmptyStateRadar';

function isNew(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return (Date.now() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
}


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
  const [mapBounds, setMapBounds] = useState<{ n: number, s: number, e: number, w: number } | null>(null);
  const [showMobileMap, setShowMobileMap] = useState(false); // H67
  const { filters, hasActiveFilters, setDrawerOpen, setFilter } = useFilterStore();

  const fetcher = (url: string) => fetch(url).then(res => {
    if (!res.ok) throw new Error('Falha ao carregar imóveis.');
    return res.json();
  });

  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.nextCursor) return null;
    const params = new URLSearchParams();
    if (filters.minPrice > 0) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice < 10000000) params.append('maxPrice', filters.maxPrice.toString()); // Usando um valor alto como teto
    if (filters.minBedrooms > 0) params.append('bedrooms', filters.minBedrooms.toString());
    if (filters.petFriendly !== null) params.append('petFriendly', filters.petFriendly.toString());
    if (filters.furnished !== null) params.append('furnished', filters.furnished.toString());
    if (filters.city !== null) params.append('city', filters.city);
    params.append('limit', '10');
    if (pageIndex > 0 && previousPageData.nextCursor) {
      params.append('cursor', previousPageData.nextCursor);
    }
    return `/api/properties?${params.toString()}`;
  };

  const { data, error, size, setSize, isValidating } = useSWRInfinite(getKey, fetcher, { revalidateOnFocus: false });

  const debouncedMapBounds = useDebounce(mapBounds, 300);

  // Buscar os dados ultra-leves globais para o Mapa
  const getMapKey = () => {
    const params = new URLSearchParams();
    if (filters.minPrice > 0) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice < 10000000) params.append('maxPrice', filters.maxPrice.toString());
    if (filters.minBedrooms > 0) params.append('bedrooms', filters.minBedrooms.toString());
    if (filters.petFriendly !== null) params.append('petFriendly', filters.petFriendly.toString());
    if (filters.furnished !== null) params.append('furnished', filters.furnished.toString());
    if (filters.city !== null) params.append('city', filters.city);
    if (debouncedMapBounds) {
      params.append('n', debouncedMapBounds.n.toString());
      params.append('s', debouncedMapBounds.s.toString());
      params.append('e', debouncedMapBounds.e.toString());
      params.append('w', debouncedMapBounds.w.toString());
    }
    return `/api/properties/map?${params.toString()}`;
  };

  const { data: mapPropertiesData } = useSWR(getMapKey, fetcher, { revalidateOnFocus: false });
  const mapProperties = mapPropertiesData || [];

  const properties = data ? data.flatMap(page => page.properties) : [];
  const isLoadingInitialData = !data && !error;
  const isLoadingMore = isLoadingInitialData || (size > 0 && data && typeof data[size - 1] === "undefined");
  const isEmpty = data?.[0]?.properties?.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.nextCursor === null);

  // Preço médio para Badge "Abaixo da Média" nos cards
  const avgPrice = useMemo(() => {
    if (properties.length === 0) return 0;
    return properties.reduce((sum, p) => sum + p.price, 0) / properties.length;
  }, [properties]);

  // A barra lateral só renderiza os paginados, mas se houver filtro poligonal, 
  // ela exibe apenas os imóveis que caem dentro do polígono.
  const propertiesToDisplay = polygonFilteredIds
    ? properties.filter(p => polygonFilteredIds.includes(p.id))
    : properties;

  // O mapa renderiza TODOS os imóveis globais que batem com os filtros textuais/numéricos,
  // e o Lasso filtra esses imóveis se houver polígono.
  const mapPropertiesToDisplay = polygonFilteredIds 
    ? mapProperties.filter((p: any) => polygonFilteredIds.includes(p.id))
    : mapProperties;

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
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--background)]">
      <SplashScreen />

      {/* A9: Header com Glassmorphism e busca funcional */}
      <Header propertiesCount={properties.filter(p => isNew((p as any).createdAt || new Date())).length} />

      {/* Main Split Layout */}
      <main className="flex flex-1 flex-col md:flex-row overflow-hidden">
        
        {/* Left Panel: Filters & Property List */}
        <section className="w-full md:w-1/2 lg:w-[600px] h-full flex flex-col bg-gray-50 dark:bg-[#0a0a0a] border-r border-gray-200 dark:border-white/5 z-10 shrink-0">
          
          {/* Filters Bar */}
          <div className="p-4 border-b border-gray-200 dark:border-white/5 bg-white/80 dark:bg-black/60 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center justify-between">
              <p className="font-medium text-sm text-gray-600 dark:text-gray-300">
                {isLoadingInitialData ? (
                  <span className="inline-block h-4 w-28 shimmer bg-gray-200 dark:bg-white/10 rounded-full" />
                ) : (
                  <>
                    <span className="text-gray-900 dark:text-white font-black">{propertiesToDisplay.length}</span>
                    {' '}imóveis {polygonFilteredIds ? 'na área' : 'encontrados'}
                  </>
                )}
              </p>
              <button 
                onClick={() => setDrawerOpen(true)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border rounded-full transition-all ${
                  hasActiveFilters 
                    ? 'border-indigo-400 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 shadow-sm shadow-indigo-200 dark:shadow-indigo-900/30' 
                    : 'border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5'
                }`}>
                <SlidersHorizontal size={15} />
                <span>Filtros{hasActiveFilters ? ' ✦' : ''}</span>
              </button>
            </div>
            {/* Quick Chips */}
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
              {[
                { label: '🐾 Pet Friendly', filter: () => setFilter('petFriendly', true) },
                { label: '🛋️ Mobiliado',   filter: () => setFilter('furnished', true) },
                { label: '🏙️ Gurupi',       filter: () => setFilter('city', 'Gurupi') },
                { label: '🏛️ Natividade',   filter: () => setFilter('city', 'Natividade') },
              ].map(chip => (
                <button
                  key={chip.label}
                  onClick={chip.filter}
                  className="whitespace-nowrap px-3 py-1.5 text-xs font-semibold rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 text-gray-600 dark:text-gray-300 transition-all"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {isLoadingInitialData ? (
              <PropertyListSkeleton count={3} />
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-4xl mb-4">😕</div>
                <p className="font-semibold text-gray-700 dark:text-gray-200">{error?.message || String(error)}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 px-5 py-2 bg-primary text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  Tentar novamente
                </button>
              </div>
            ) : propertiesToDisplay.length === 0 ? (
              <EmptyStateRadar />
            ) : (
              <>
                {propertiesToDisplay.map((property, index) => (
                  <FadeInItem key={property.id} index={index}>
                    <PropertyCard 
                      property={property as any}
                      avgPrice={avgPrice}
                      onClick={() => setSelectedPropertyId(property.id)} 
                    />
                  </FadeInItem>
                ))}
                
                {/* Botão de Carregar Mais */}
                {!isReachingEnd && (
                  <div className="text-center py-4">
                    <button
                      onClick={() => setSize(size + 1)}
                      disabled={isLoadingMore}
                      className="px-6 py-2.5 rounded-full border border-indigo-200 dark:border-indigo-900/50 bg-white dark:bg-[#1a1a1a] text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all disabled:opacity-50"
                    >
                      {isLoadingMore ? 'Carregando...' : 'Carregar Mais'}
                    </button>
                  </div>
                )}
                
                {isReachingEnd && !isEmpty && (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500">
                      Mostrando <span className="font-bold text-gray-700 dark:text-gray-300">{propertiesToDisplay.length}</span> imóveis.{' '}
                      <a href="#" className="text-indigo-500 hover:underline font-medium">Ampliar busca?</a>
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Right Panel: Map — always in DOM, visible md+ or when showMobileMap */}
        <section className={`
          flex-1 h-full relative z-0
          ${showMobileMap ? 'block fixed inset-0 z-[300]' : 'hidden md:block'}
        `}>
          <MapComponent 
            properties={mapPropertiesToDisplay}
            onPropertySelect={setSelectedPropertyId} 
            onPolygonFilter={handlePolygonFilter}
            onBoundsChange={setMapBounds}
          />
          
          {/* Status pill */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] bg-white/95 dark:bg-black/85 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-black/5 dark:border-white/10 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isLoadingInitialData ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500 animate-pulse'}`} />
            <span className="text-xs font-semibold dark:text-gray-200 text-gray-700">
              {isLoadingInitialData ? 'Carregando...' : polygonFilteredIds ? `${mapPropertiesToDisplay.length} na área` : `${mapProperties.length} imóveis no mapa`}
            </span>
          </div>

          {/* H67: Fechar mapa fullscreen no mobile */}
          {showMobileMap && (
            <button
              onClick={() => setShowMobileMap(false)}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[400] bg-white dark:bg-[#111] text-gray-800 dark:text-white px-6 py-3 rounded-full shadow-xl font-bold text-sm border border-gray-200 dark:border-white/10 flex items-center gap-2"
            >
              ✕ Fechar Mapa
            </button>
          )}
        </section>

        {/* H67: Botão flutuante "Ver Mapa" no mobile */}
        {!showMobileMap && (
          <button
            onClick={() => setShowMobileMap(true)}
            className="md:hidden fixed bottom-20 right-4 z-[390] bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-5 py-3 rounded-full shadow-xl shadow-indigo-500/40 font-bold text-sm flex items-center gap-2"
          >
            <MapIcon size={16} /> Ver Mapa
          </button>
        )}


      </main>

      {/* Botão Contextual do Modo Radar */}
      <CreateRadarButton />

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
