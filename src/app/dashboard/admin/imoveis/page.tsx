'use client';

import { useState } from 'react';
import Link from 'next/link';
import useSWRInfinite from 'swr/infinite';
import { Plus, Edit2, Trash2, Search, Eye, RefreshCw, AlertCircle } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AdminPropertiesManager() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // G57 & G58: Paginação cursor-based + SWR
  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.nextCursor) return null; // reached the end
    
    let url = `/api/properties/admin?search=${encodeURIComponent(searchTerm)}`;
    if (pageIndex !== 0 && previousPageData.nextCursor) {
      url += `&cursor=${previousPageData.nextCursor}`;
    }
    return url;
  };

  const { data, size, setSize, isValidating, mutate } = useSWRInfinite(getKey, fetcher, {
    revalidateOnFocus: false, // Evita re-fetch desnecessário
  });

  const properties = data ? data.flatMap(page => page.properties) : [];
  const isLoadingInitialData = !data && isValidating;
  const isLoadingMore = isValidating && size > 0 && data && typeof data[size - 1] === "undefined";
  const isEmpty = data?.[0]?.properties.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.nextCursor === null);

  const handleDelete = async (id: string) => {
    if (confirm('🚨 ATENÇÃO: Tem certeza que deseja excluir permanentemente este imóvel?')) {
      const res = await fetch(`/api/properties/${id}`, { method: 'DELETE' });
      if (res.ok) {
        mutate(); // Revalida o cache local do SWR
      } else {
        alert('Erro ao excluir imóvel.');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Gerenciar Imóveis</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Catálogo de anúncios no sistema.</p>
        </div>
        <Link 
          href="/dashboard/admin/imoveis/novo"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/30"
        >
          <Plus size={20} />
          Novo Imóvel
        </Link>
      </div>

      <div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-200 dark:border-white/10 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por título ou endereço..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button 
            onClick={() => mutate()}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <RefreshCw size={16} className={isValidating ? 'animate-spin' : ''} />
            Atualizar
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-white/10">
              <tr>
                <th className="px-6 py-4 font-bold">Imóvel</th>
                <th className="px-6 py-4 font-bold">Valor (Aluguel)</th>
                <th className="px-6 py-4 font-bold">Métricas</th>
                <th className="px-6 py-4 font-bold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {isLoadingInitialData ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                    <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-indigo-500" />
                    Carregando imóveis...
                  </td>
                </tr>
              ) : isEmpty ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <AlertCircle size={24} className="mx-auto mb-2 opacity-50" />
                    Nenhum imóvel encontrado.
                  </td>
                </tr>
              ) : properties.map((prop: any) => (
                <tr key={prop.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {prop.featuredImage ? (
                        <img src={prop.featuredImage} alt="" className="w-14 h-14 rounded-xl object-cover shadow-sm border border-black/5" />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-white/5 border border-black/5 flex items-center justify-center">
                          <span className="text-[10px] text-gray-400">Sem Imagem</span>
                        </div>
                      )}
                      <div>
                        <Link href={`/imovel/${prop.id}`} target="_blank" className="font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                          {prop.title}
                        </Link>
                        <p className="text-xs text-gray-500 truncate max-w-[200px] mt-0.5">{prop.address}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-black text-indigo-600 dark:text-indigo-400 text-base">
                      R$ {prop.price.toLocaleString('pt-BR')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                        <Eye size={14} className="text-emerald-500" /> {prop.viewCount} views
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/dashboard/admin/imoveis/${prop.id}/editar`}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                        title="Editar Imóvel"
                      >
                        <Edit2 size={18} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(prop.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Excluir Permanentemente"
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
        
        {/* Load More Button */}
        {!isEmpty && !isReachingEnd && (
          <div className="p-4 border-t border-gray-100 dark:border-white/10 text-center">
            <button
              onClick={() => setSize(size + 1)}
              disabled={isLoadingMore}
              className="px-6 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 font-semibold rounded-full text-sm transition-colors disabled:opacity-50"
            >
              {isLoadingMore ? 'Carregando...' : 'Carregar mais'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
