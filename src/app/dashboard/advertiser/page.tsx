'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Eye, MousePointerClick, Heart, Building, Loader2, TrendingUp } from 'lucide-react';
import Link from 'next/link';

// DYNAMIC IMPORT para o Recharts (pesado) não travar o bundle principal
const AnalyticsChart = dynamic(() => import('@/components/AnalyticsChart'), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>
});

export default function AdvertiserDashboard() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/advertiser/analytics')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <div className="p-8 flex items-center justify-center h-[60vh]"><Loader2 className="animate-spin text-indigo-500 w-8 h-8" /></div>;
  }

  if (data?.error) {
    return <div className="p-8 text-red-500 font-bold">Erro: {data.error}. Certifique-se de estar logado como ADVERTISER ou ADMIN.</div>;
  }

  const kpis = [
    { title: "Meus Imóveis", value: data.totalProperties, icon: <Building size={20} className="text-blue-500" />, bg: "bg-blue-50 dark:bg-blue-900/20" },
    { title: "Visualizações Totais", value: data.totalViews, icon: <Eye size={20} className="text-indigo-500" />, bg: "bg-indigo-50 dark:bg-indigo-900/20" },
    { title: "Leads (Cliques WhatsApp)", value: data.totalClicks, icon: <MousePointerClick size={20} className="text-emerald-500" />, bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { title: "Favoritados", value: data.totalFavorites, icon: <Heart size={20} className="text-rose-500" />, bg: "bg-rose-50 dark:bg-rose-900/20" }
  ];

  const conversionRate = data.totalViews > 0 ? ((data.totalClicks / data.totalViews) * 100).toFixed(1) : "0.0";

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">Dashboard de Resultados</h1>
          <p className="text-gray-500 mt-1">Acompanhe a performance dos seus imóveis nos últimos 30 dias.</p>
        </div>
        <Link 
          href="/dashboard/admin/imoveis" 
          className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 px-5 py-2.5 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:border-indigo-500 transition-all flex items-center gap-2 w-fit shadow-sm"
        >
          <Building size={16} /> Gerenciar Imóveis
        </Link>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/10 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className={`w-12 h-12 rounded-2xl ${kpi.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              {kpi.icon}
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-semibold text-sm mb-1">{kpi.title}</p>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white">{kpi.value.toLocaleString('pt-BR')}</h3>
            
            {/* Efeito decorativo */}
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br from-white/0 to-gray-50 dark:to-white/5 rounded-full blur-2xl pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Area Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111] border border-gray-100 dark:border-white/10 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tráfego vs Conversão</h2>
              <p className="text-sm text-gray-500">Visualizações de página e cliques no WhatsApp</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-indigo-500" /> Views</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-500" /> Leads</div>
            </div>
          </div>
          <div className="w-full h-[300px]">
            <AnalyticsChart data={data.chartData} />
          </div>
        </div>

        {/* Side Panel: Conversão */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-500/20 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/20">
              <TrendingUp size={24} className="text-white" />
            </div>
            <h2 className="text-lg font-bold text-white/90">Taxa de Conversão Global</h2>
            <p className="text-white/70 text-sm mt-1 mb-6">Porcentagem de visitantes que clicam para falar no WhatsApp.</p>
            
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-black">{conversionRate}</span>
              <span className="text-2xl font-bold text-indigo-200">%</span>
            </div>
          </div>
          
          <div className="relative z-10 mt-8 pt-6 border-t border-white/20">
            <p className="text-sm text-indigo-100 leading-relaxed font-medium">
              Dica: Anúncios com galerias completas e descrições claras convertem até <strong className="text-white">3x mais</strong>.
            </p>
          </div>

          {/* Efeitos de fundo */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white opacity-10 blur-3xl rounded-full" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-black opacity-20 blur-3xl rounded-full" />
        </div>

      </div>
    </div>
  );
}
