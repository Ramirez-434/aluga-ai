'use client';

import { useState } from 'react';
import { MOCK_POIS, POI } from '@/data/mockPOIs';
import { Plus, Edit2, Trash2, Search, Map } from 'lucide-react';

export default function AdminPOIsManager() {
  const [pois, setPois] = useState<POI[]>(MOCK_POIS);
  const [searchTerm, setSearchTerm] = useState('');

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta conveniência do mapa?')) {
      setPois(pois.filter(p => p.id !== id));
    }
  };

  const filteredPois = pois.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Gerenciar Conveniências (Localidades)</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Pontos de interesse que aparecem no mapa do usuário.</p>
        </div>
        <button 
          onClick={() => alert("Janela de Adição de Local abrirá aqui.")}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Novo Ponto
        </button>
      </div>

      <div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-200 dark:border-white/10">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou categoria..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-6 py-4 font-medium">Nome do Local</th>
                <th className="px-6 py-4 font-medium">Categoria</th>
                <th className="px-6 py-4 font-medium">Coordenadas (Lat, Lng)</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/10">
              {filteredPois.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Nenhum ponto encontrado.</td>
                </tr>
              ) : filteredPois.map(poi => (
                <tr key={poi.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-white/10 rounded-lg text-gray-500 dark:text-gray-300">
                      <Map size={18} />
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">{poi.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium uppercase tracking-wider bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 rounded-lg">
                      {poi.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs font-mono">
                    {poi.lat}, {poi.lng}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => alert("Janela de Edição abrirá aqui.")}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(poi.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
