import { create } from 'zustand';
import { Property } from '@/data/mockProperties';

interface CompareStore {
  compareList: Property[];
  isModalOpen: boolean;
  addProperty: (property: Property) => void;
  removeProperty: (id: string) => void;
  clearCompareList: () => void;
  setModalOpen: (isOpen: boolean) => void;
}

export const useCompareStore = create<CompareStore>((set) => ({
  compareList: [],
  isModalOpen: false,
  addProperty: (property) => set((state) => {
    if (state.compareList.length >= 3) {
      alert("Você pode comparar no máximo 3 imóveis ao mesmo tempo.");
      return state;
    }
    if (state.compareList.some(p => p.id === property.id)) return state;
    return { compareList: [...state.compareList, property] };
  }),
  removeProperty: (id) => set((state) => ({
    compareList: state.compareList.filter((p) => p.id !== id)
  })),
  clearCompareList: () => set({ compareList: [] }),
  setModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
}));
