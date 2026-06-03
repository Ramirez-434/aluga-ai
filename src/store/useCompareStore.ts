import { create } from 'zustand';
import { toast } from 'sonner';
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
      toast.warning('Limite atingido', { description: 'Você pode comparar no máximo 3 imóveis.' });
      return state;
    }
    if (state.compareList.some(p => p.id === property.id)) {
      toast.info('Já adicionado', { description: `${property.title} já está na comparação.` });
      return state;
    }
    toast.success('Adicionado!', { description: `${property.title} foi adicionado ao comparador.` });
    return { compareList: [...state.compareList, property] };
  }),
  removeProperty: (id) => set((state) => {
    toast.info('Removido da comparação.');
    return { compareList: state.compareList.filter((p) => p.id !== id) };
  }),
  clearCompareList: () => set({ compareList: [] }),
  setModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
}));
