'use client';

import { useState, useEffect } from 'react';
import { Loader2, Users, Search, Phone, ExternalLink, Calendar, MapPin, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface WaitlistLead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  property: {
    id: string;
    title: string;
    city: string;
    status: string;
  };
}

export default function LeadsDashboard() {
  const [leads, setLeads] = useState<WaitlistLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/advertiser/leads')
      .then(res => res.json())
      .then(data => {
        setLeads(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.property.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Users size={32} className="text-indigo-600 dark:text-indigo-400" />
            Central de Leads
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Gerencie os interessados na fila de espera dos seus imóveis (B2B CRM).
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Buscar por nome, email ou imóvel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111] text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all dark:text-white"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <Loader2 className="animate-spin text-indigo-500 w-8 h-8" />
          <p className="text-sm text-gray-500">Carregando CRM...</p>
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/10 rounded-3xl p-12 text-center shadow-sm">
          <Users size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Nenhum lead encontrado</h3>
          <p className="text-gray-500 mt-2 max-w-md mx-auto text-sm">
            Sua fila de espera está vazia. Quando um usuário se interessar por um imóvel alugado, ele aparecerá aqui.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/10 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-100 dark:border-white/10">
                <tr>
                  <th className="px-6 py-4">Nome & Contato</th>
                  <th className="px-6 py-4">Imóvel Desejado</th>
                  <th className="px-6 py-4">Data de Inscrição</th>
                  <th className="px-6 py-4 text-right">Ação B2B</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 dark:text-white">{lead.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{lead.email}</div>
                      {lead.phone && (
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Phone size={10} /> {lead.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/imovel/${lead.property.id}`} target="_blank" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                        {lead.property.title} <ExternalLink size={12} />
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-1 text-[10px] text-gray-500">
                          <MapPin size={10} /> {lead.property.city}
                        </span>
                        {lead.property.status === 'AVAILABLE' ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                            <CheckCircle2 size={10} /> Disponível!
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-red-600 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
                            Alugado
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {lead.phone ? (
                        <a 
                          href={`https://wa.me/${lead.phone.replace(/\D/g, '')}?text=Olá ${lead.name}, vi que você tem interesse no imóvel ${lead.property.title}.`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
                        >
                          <Phone size={12} /> Falar no WhatsApp
                        </a>
                      ) : (
                        <a 
                          href={`mailto:${lead.email}?subject=Aluga AI - Interesse no Imóvel ${lead.property.title}`}
                          className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
                        >
                          E-mail
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
