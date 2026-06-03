import { create } from 'zustand';

export interface FilterParams {
  minPrice: number;
  maxPrice: number;
  minBedrooms: number;
  petFriendly: boolean | null;   // null = indiferente
  furnished: boolean | null;     // null = indiferente
  city: string | null;           // null = todas as cidades
}

const DEFAULT_FILTERS: FilterParams = {
  minPrice: 0,
  maxPrice: 10000,
  minBedrooms: 0,
  petFriendly: null,
  furnished: null,
  city: null,
};

interface FilterStore {
  filters: FilterParams;
  isDrawerOpen: boolean;
  hasActiveFilters: boolean;
  setFilter: <K extends keyof FilterParams>(key: K, value: FilterParams[K]) => void;
  resetFilters: () => void;
  setDrawerOpen: (open: boolean) => void;
}

export const useFilterStore = create<FilterStore>((set, get) => ({
  filters: DEFAULT_FILTERS,
  isDrawerOpen: false,
  hasActiveFilters: false,

  setFilter: (key, value) => {
    const newFilters = { ...get().filters, [key]: value };
    const hasActive =
      newFilters.minPrice > DEFAULT_FILTERS.minPrice ||
      newFilters.maxPrice < DEFAULT_FILTERS.maxPrice ||
      newFilters.minBedrooms > 0 ||
      newFilters.petFriendly !== null ||
      newFilters.furnished !== null ||
      newFilters.city !== null;

    set({ filters: newFilters, hasActiveFilters: hasActive });
  },

  resetFilters: () => set({ filters: DEFAULT_FILTERS, hasActiveFilters: false }),

  setDrawerOpen: (open) => set({ isDrawerOpen: open }),
}));
