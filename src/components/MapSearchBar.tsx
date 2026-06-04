'use client';

import { useState, useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { Search, MapPin, Loader2, X } from 'lucide-react';
import { searchLocation, NominatimResult } from '@/services/nominatimApi';
import { useDebounce } from 'use-debounce';

export function MapSearchBar() {
  const map = useMap();
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 500);
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Fechar o dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const fetchResults = async () => {
      setIsSearching(true);
      const data = await searchLocation(debouncedQuery);
      setResults(data);
      setIsOpen(true);
      setIsSearching(false);
    };

    fetchResults();
  }, [debouncedQuery]);

  const handleSelect = (result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    
    // Voa para o local com uma animação suave
    map.flyTo([lat, lon], 16, {
      animate: true,
      duration: 1.5
    });

    setQuery(result.display_name.split(',')[0]); // Define apenas o nome curto
    setIsOpen(false);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  // Previne a propagação de eventos do mouse/teclado para o Leaflet (para não arrastar o mapa ao digitar)
  const preventPropagation = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      ref={wrapperRef} 
      className="absolute top-4 left-1/2 -translate-x-1/2 z-[1020] w-[90%] max-w-[400px]"
      onMouseDown={preventPropagation}
      onDoubleClick={preventPropagation}
      onTouchStart={preventPropagation}
      onWheel={preventPropagation}
    >
      <div className="relative flex items-center bg-white dark:bg-[#1f2937] rounded-full shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary/50">
        <div className="pl-4 pr-2 text-gray-500">
          {isSearching ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : <Search className="w-5 h-5" />}
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          placeholder="Buscar bairro, faculdade, endereço..."
          className="w-full py-3.5 pr-4 bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
        />

        {query && (
          <button 
            onClick={clearSearch}
            className="pr-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Resultados do Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1f2937] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <ul className="py-2 max-h-[300px] overflow-y-auto custom-scrollbar">
            {results.map((result) => {
              const parts = result.display_name.split(',');
              const title = parts[0];
              const subtitle = parts.slice(1).join(',').trim();

              return (
                <li key={result.place_id}>
                  <button
                    onClick={() => handleSelect(result)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-start gap-3 group"
                  >
                    <div className="mt-0.5 bg-gray-100 dark:bg-gray-800 group-hover:bg-primary/10 p-2 rounded-full text-gray-500 group-hover:text-primary transition-colors">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {subtitle}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
