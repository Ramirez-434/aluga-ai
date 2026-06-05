'use client';

import { useEffect, useState } from 'react';
import { Mail, Phone, Clock, MessageCircle, Building } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Lead {
  id: string;
  propertyId: string;
  propertyName: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/advertiser/leads')
      .then(res => res.json())
      .then(data => {
        if (data.leads) setLeads(data.leads);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const handleWhatsApp = (phone: string, propertyName: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const text = encodeURIComponent(`Olá! Vi que você se cadastrou na fila de espera para o imóvel "${propertyName}". O imóvel acaba de ficar disponível!`);
    window.open(`https://wa.me/55${cleanPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Central de Leads B2B</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Contatos capturados pelo Radar de Preço e Fila de Espera.</p>
      </div>

      <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl border border-gray-200 dark:border-white/10 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-black/50 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Lead</th>
                <th className="px-6 py-4">Imóvel de Interesse</th>
                <th className="px-6 py-4">Tempo de Espera</th>
                <th className="px-6 py-4 text-right">Ação Rápida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-medium">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                      Carregando CRM...
                    </div>
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-medium">
                    Nenhum lead capturado ainda. Divulgue mais imóveis!
                  </td>
                </tr>
              ) : (
                leads.map(lead => (
                  <tr key={lead.id} className="hover:bg-indigo-50/50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 dark:text-white">{lead.name}</span>
                        <div className="flex items-center gap-3 text-gray-500 text-xs mt-1">
                          <span className="flex items-center gap-1"><Mail size={12} /> {lead.email}</span>
                          {lead.phone && <span className="flex items-center gap-1"><Phone size={12} /> {lead.phone}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-300">
                        <Building size={14} className="text-indigo-400" />
                        {lead.propertyName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                        <Clock size={12} />
                        {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true, locale: ptBR })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {lead.phone ? (
                        <button
                          onClick={() => handleWhatsApp(lead.phone!, lead.propertyName)}
                          className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1ebd5a] text-white px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-lg shadow-green-500/30 hover:scale-105"
                        >
                          <MessageCircle size={14} />
                          WhatsApp
                        </button>
                      ) : (
                        <a
                          href={`mailto:${lead.email}`}
                          className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl font-bold text-xs transition-all"
                        >
                          <Mail size={14} />
                          E-mail
                        </a>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
