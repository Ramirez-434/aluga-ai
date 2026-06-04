import { create } from 'zustand';
import { toast } from 'sonner';
import { mutate } from 'swr';

export interface FilterParams {
  minPrice: number;
  maxPrice: number;
  minBedrooms: number;
  petFriendly: boolean | null;   // null = indiferente
  furnished: boolean | null;     // null = indiferente
  city: string | null;           // null = todas as cidades
  propertyCategory: 'RESIDENTIAL' | 'COMMERCIAL';
  transactionType: 'RENT' | 'SALE';
}

const DEFAULT_FILTERS: FilterParams = {
  minPrice: 0,
  maxPrice: 10000,
  minBedrooms: 0,
  petFriendly: null,
  furnished: null,
  city: null,
  propertyCategory: 'RESIDENTIAL',
  transactionType: 'RENT',
};

interface FilterStore {
  filters: FilterParams;
  isDrawerOpen: boolean;
  hasActiveFilters: boolean;
  hoveredPropertyId: string | null;
  mapBounds: { n: number, s: number, e: number, w: number } | null;
  setFilter: <K extends keyof FilterParams>(key: K, value: FilterParams[K]) => void;
  resetFilters: () => void;
  setDrawerOpen: (open: boolean) => void;
  setHoveredPropertyId: (id: string | null) => void;
  setMapBounds: (bounds: { n: number, s: number, e: number, w: number } | null) => void;
}

export const useFilterStore = create<FilterStore>((set, get) => ({
  filters: DEFAULT_FILTERS,
  isDrawerOpen: false,
  hasActiveFilters: false,
  hoveredPropertyId: null,
  mapBounds: null,

  setFilter: (key, value) => {
    const newFilters = { ...get().filters, [key]: value };
    const hasActive =
      newFilters.minPrice > DEFAULT_FILTERS.minPrice ||
      newFilters.maxPrice < DEFAULT_FILTERS.maxPrice ||
      newFilters.minBedrooms > 0 ||
      newFilters.petFriendly !== null ||
      newFilters.furnished !== null ||
      newFilters.city !== null ||
      newFilters.propertyCategory !== 'RESIDENTIAL' ||
      newFilters.transactionType !== 'RENT';

    // Se mudou a categoria, podemos limpar alguns filtros que não fazem sentido (ex: quartos num galpão comercial)
    if (key === 'propertyCategory' && value !== get().filters.propertyCategory) {
      if (value === 'COMMERCIAL') {
        newFilters.minBedrooms = 0;
        newFilters.petFriendly = null;
        newFilters.furnished = null;
      }
      
      // Purgar agressivamente o cache do SWR para forçar o Loading State (Esqueleto)
      mutate(
        (key) => typeof key === 'string' && key.startsWith('/api/properties'),
        undefined,
        { revalidate: true }
      );
    }

    set({ filters: newFilters, hasActiveFilters: hasActive });
  },

  resetFilters: () => {
    set({ filters: DEFAULT_FILTERS, hasActiveFilters: false });
    toast.success('Filtros limpos', { description: 'Exibindo todos os imóveis.' });
  },

  setDrawerOpen: (open) => set({ isDrawerOpen: open }),

  setHoveredPropertyId: (id) => set({ hoveredPropertyId: id }),

  setMapBounds: (bounds) => set({ mapBounds: bounds }),
}));
