import { create } from 'zustand';

interface FavoriteStore {
  favorites: string[]; // list of propertyIds
  setFavorites: (favorites: string[]) => void;
  toggleFavorite: (propertyId: string) => void;
}

export const useFavoriteStore = create<FavoriteStore>((set) => ({
  favorites: [],
  setFavorites: (favorites) => set({ favorites }),
  toggleFavorite: (propertyId) => set((state) => {
    const isFav = state.favorites.includes(propertyId);
    return {
      favorites: isFav 
        ? state.favorites.filter(id => id !== propertyId)
        : [...state.favorites, propertyId]
    };
  }),
}));
