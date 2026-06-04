'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Eye, MousePointerClick, Heart, Building, Loader2,
  TrendingUp, BarChart2, Crown, MapPin, Trophy,
  Star, ArrowUpRight, Zap
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// DYNAMIC IMPORT para os gráficos pesados
const AnalyticsChart = dynamic(() => import('@/components/AnalyticsChart'), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>
});

const PropertyBarChart = dynamic(() => import('@/components/PropertyBarChart'), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>
});

type Tab = 'overview' | 'properties';

interface PropertyStat {
  id: string;
  title: string;
  price: number;
  city: string;
  isPremium: boolean;
  featuredImage: string | null;
  views: number;
  clicks: number;
  favorites: number;
  ctr: number;
  score: number;
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 70 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40'
    : score >= 35 ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40'
    : 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800/40';
  const label = score >= 70 ? 'Excelente' : score >= 35 ? 'Bom' : 'Atenção';

  return (
    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${color}`}>
      {label} {score}pts
    </span>
  );
}

export default function AdvertiserDashboard() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Fetch once on mount
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
    return (
      <div className="p-8 flex flex-col items-center justify-center h-[60vh] gap-3">
        <Loader2 className="animate-spin text-indigo-500 w-8 h-8" />
        <p className="text-sm text-gray-500">Carregando analytics...</p>
      </div>
    );
  }

  if (data?.error) {
    return (
      <div className="p-8 text-red-500 font-bold bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200">
        ⚠️ {data.error}. Certifique-se de estar logado como ADVERTISER ou ADMIN.
      </div>
    );
  }

  const kpis = [
    {
      title: "Meus Imóveis",
      value: data.totalProperties,
      icon: <Building size={20} className="text-blue-500" />,
      bg: "bg-blue-50 dark:bg-blue-900/20",
      ring: "ring-blue-100 dark:ring-blue-900/30"
    },
    {
      title: "Visualizações",
      value: data.totalViews,
      icon: <Eye size={20} className="text-indigo-500" />,
      bg: "bg-indigo-50 dark:bg-indigo-900/20",
      ring: "ring-indigo-100 dark:ring-indigo-900/30"
    },
    {
      title: "Leads (WhatsApp)",
      value: data.totalClicks,
      icon: <MousePointerClick size={20} className="text-emerald-500" />,
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      ring: "ring-emerald-100 dark:ring-emerald-900/30"
    },
    {
      title: "Favoritados",
      value: data.totalFavorites,
      icon: <Heart size={20} className="text-rose-500" />,
      bg: "bg-rose-50 dark:bg-rose-900/20",
      ring: "ring-rose-100 dark:ring-rose-900/30"
    }
  ];

  const conversionRate = data.totalViews > 0
    ? ((data.totalClicks / data.totalViews) * 100).toFixed(1)
    : "0.0";

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: <BarChart2 size={15} /> },
    { id: 'properties', label: 'Por Imóvel', icon: <Building size={15} /> },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">
            Dashboard de Resultados
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Performance consolidada dos seus anúncios nos últimos 30 dias.
          </p>
        </div>
        <Link
          href="/dashboard/admin/imoveis"
          className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center gap-2 w-fit"
        >
          <Building size={16} /> Gerenciar Imóveis
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/10 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
          >
            <div className={`w-11 h-11 rounded-2xl ${kpi.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ring-4 ${kpi.ring}`}>
              {kpi.icon}
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-semibold text-xs mb-1">{kpi.title}</p>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white tabular-nums">
              {kpi.value.toLocaleString('pt-BR')}
            </h3>
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-gradient-to-br from-white/0 to-gray-50 dark:to-white/5 rounded-full blur-xl pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 p-1 rounded-2xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-[#111] text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: VISÃO GERAL */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Area Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-[#111] border border-gray-100 dark:border-white/10 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Tráfego × Conversão</h2>
                <p className="text-xs text-gray-500 mt-0.5">Visualizações e leads WhatsApp</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" /> Views</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Leads</span>
              </div>
            </div>
            <div className="w-full h-[280px]">
              <AnalyticsChart data={data.chartData} />
            </div>
          </div>

          {/* Conversion Panel */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-500/20 flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center mb-5 backdrop-blur-md border border-white/20">
                <TrendingUp size={22} className="text-white" />
              </div>
              <h2 className="text-base font-bold text-white/90">Taxa de Conversão</h2>
              <p className="text-white/60 text-xs mt-1 mb-5">% de visitantes que clicam no WhatsApp</p>

              <div className="flex items-baseline gap-1">
                <span className="text-6xl font-black tabular-nums">{conversionRate}</span>
                <span className="text-xl font-bold text-indigo-200">%</span>
              </div>

              {/* Progress bar */}
              <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-white/80 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(100, parseFloat(conversionRate) * 5)}%` }}
                />
              </div>
            </div>

            <div className="relative z-10 mt-6 pt-5 border-t border-white/20">
              <p className="text-xs text-indigo-100 leading-relaxed">
                💡 Anúncios com galerias completas convertem <strong className="text-white">até 3×</strong> mais.
              </p>
            </div>

            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white opacity-10 blur-3xl rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-black opacity-20 blur-3xl rounded-full pointer-events-none" />
          </div>

          {/* Bar Chart: Comparison */}
          <div className="lg:col-span-3 bg-white dark:bg-[#111] border border-gray-100 dark:border-white/10 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-violet-50 dark:bg-violet-900/20 rounded-2xl flex items-center justify-center">
                <BarChart2 size={18} className="text-violet-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Comparativo por Imóvel</h2>
                <p className="text-xs text-gray-500 mt-0.5">Top 5 anúncios: Views, Leads e Favoritos</p>
              </div>
            </div>
            <div className="w-full h-[260px]">
              <PropertyBarChart data={data.barChartData} />
            </div>
          </div>
        </div>
      )}

      {/* TAB: POR IMÓVEL — Ranking */}
      {activeTab === 'properties' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <Trophy size={18} className="text-amber-500" />
            <h2 className="text-base font-bold text-gray-700 dark:text-gray-300">
              Ranking de Performance
            </h2>
            <span className="text-xs text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-full">
              ordenado por Score
            </span>
          </div>

          {data.propertiesStats.length === 0 && (
            <div className="bg-gray-50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10 rounded-3xl p-12 text-center">
              <Building size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-semibold">Nenhum imóvel cadastrado ainda.</p>
              <Link href="/dashboard/admin/imoveis" className="mt-4 inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:underline">
                Cadastrar meu primeiro imóvel <ArrowUpRight size={15} />
              </Link>
            </div>
          )}

          {data.propertiesStats.map((prop: PropertyStat, index: number) => (
            <div
              key={prop.id}
              className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/10 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800/40 transition-all group"
            >
              <div className="flex items-center gap-4">
                {/* Ranking Position */}
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 font-black text-sm ${
                  index === 0 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
                  index === 1 ? 'bg-gray-100 dark:bg-white/10 text-gray-500' :
                  index === 2 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' :
                  'bg-gray-50 dark:bg-white/5 text-gray-400'
                }`}>
                  {index === 0 ? <Crown size={16} /> : `${index + 1}°`}
                </div>

                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 bg-gray-100 dark:bg-white/5">
                  {prop.featuredImage ? (
                    <img src={prop.featuredImage} alt={prop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building size={18} className="text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{prop.title}</p>
                    {prop.isPremium && (
                      <span className="flex items-center gap-1 text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold border border-amber-200 dark:border-amber-700/40 shrink-0">
                        <Star size={9} /> Premium
                      </span>
                    )}
                    <ScoreBadge score={prop.score} />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                    <MapPin size={11} />
                    <span>{prop.city}</span>
                    <span className="mx-1">·</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">R$ {prop.price.toLocaleString('pt-BR')}/mês</span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="hidden sm:grid grid-cols-4 gap-3 shrink-0">
                  {[
                    { label: 'Views', value: prop.views, icon: <Eye size={12} />, color: 'text-indigo-500' },
                    { label: 'Leads', value: prop.clicks, icon: <MousePointerClick size={12} />, color: 'text-emerald-500' },
                    { label: 'Favs', value: prop.favorites, icon: <Heart size={12} />, color: 'text-rose-500' },
                    { label: 'CTR', value: `${prop.ctr}%`, icon: <Zap size={12} />, color: 'text-amber-500' },
                  ].map((stat, si) => (
                    <div key={si} className="text-center">
                      <div className={`flex items-center justify-center gap-1 ${stat.color} mb-1`}>
                        {stat.icon}
                        <span className="text-[10px] font-semibold text-gray-400">{stat.label}</span>
                      </div>
                      <p className="text-sm font-black text-gray-900 dark:text-white tabular-nums">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Link */}
                <Link
                  href={`/imovel/${prop.id}`}
                  className="p-2 text-gray-400 hover:text-indigo-500 transition-colors shrink-0"
                  target="_blank"
                  title="Ver anúncio"
                >
                  <ArrowUpRight size={18} />
                </Link>
              </div>

              {/* Mobile stats strip */}
              <div className="sm:hidden mt-4 grid grid-cols-4 gap-2 text-center border-t border-gray-100 dark:border-white/5 pt-4">
                {[
                  { label: 'Views', value: prop.views, color: 'text-indigo-500' },
                  { label: 'Leads', value: prop.clicks, color: 'text-emerald-500' },
                  { label: 'Favs', value: prop.favorites, color: 'text-rose-500' },
                  { label: 'CTR', value: `${prop.ctr}%`, color: 'text-amber-500' },
                ].map((stat, si) => (
                  <div key={si}>
                    <p className={`text-base font-black tabular-nums ${stat.color}`}>{stat.value}</p>
                    <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
