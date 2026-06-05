'use client';

import { useState } from 'react';
import { Building2, Plus, ShieldCheck, Briefcase, FileText } from 'lucide-react';

export default function AgenciasPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="text-indigo-500" />
            Controle de Agências
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
            Gestão B2B corporativa: Imobiliárias, CRECI e limites de faturamento.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2"
        >
          <Plus size={18} /> Nova Agência
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { title: 'Agências Ativas', value: '12', icon: <Building2 size={20} className="text-blue-500" /> },
          { title: 'Corretores (CRECI)', value: '45', icon: <Briefcase size={20} className="text-emerald-500" /> },
          { title: 'Anúncios Gerenciados', value: '342', icon: <FileText size={20} className="text-amber-500" /> },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[#1a1a1a] p-6 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center">
              {stat.icon}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.title}</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl border border-gray-200 dark:border-white/10 shadow-xl overflow-hidden">
        <div className="p-12 text-center">
          <Building2 size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Painel de Agências em Construção</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            A infraestrutura de banco de dados para gestão corporativa de CNPJ e comissionamento será acoplada nas próximas fases do projeto.
          </p>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#1a1a1a] w-full max-w-md rounded-3xl shadow-2xl p-6 border border-gray-100 dark:border-white/10">
            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4">Cadastrar Agência B2B</h2>
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); setShowModal(false); }}>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Razão Social</label>
                <input type="text" required className="w-full mt-1 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500" placeholder="Imobiliária Exemplo LTDA" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">CNPJ</label>
                  <input type="text" required className="w-full mt-1 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500" placeholder="00.000.000/0001-00" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">CRECI Jurídico</label>
                  <input type="text" required className="w-full mt-1 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500" placeholder="J-12345" />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
