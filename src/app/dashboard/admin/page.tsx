import Link from 'next/link';
import { Building2, MapPin, Eye, Heart, TrendingUp, AlertTriangle, Plus, ArrowRight } from 'lucide-react';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// F51: KPIs reais do banco de dados
async function getStats() {
  try {
    const [totalProperties, totalViews, newThisWeek] = await Promise.all([
      prisma.property.count(),
      prisma.property.aggregate({ _sum: { viewCount: true } }),
      prisma.property.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      }),
    ]);

    return {
      totalProperties,
      totalViews: totalViews._sum.viewCount ?? 0,
      newThisWeek,
    };
  } catch {
    return { totalProperties: 0, totalViews: 0, newThisWeek: 0 };
  }
}

export default async function AdminOverview() {
  const { totalProperties, totalViews, newThisWeek } = await getStats();

  const stats = [
    {
      label: 'Imóveis Ativos',
      value: totalProperties,
      sub: `+${newThisWeek} essa semana`,
      icon: Building2,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      border: 'border-indigo-100 dark:border-indigo-800/30',
      glow: 'shadow-indigo-100 dark:shadow-indigo-900/20',
    },
    {
      label: 'Visualizações',
      value: totalViews.toLocaleString('pt-BR'),
      sub: 'Total acumulado',
      icon: Eye,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      border: 'border-emerald-100 dark:border-emerald-800/30',
      glow: 'shadow-emerald-100 dark:shadow-emerald-900/20',
    },
    {
      label: 'Novos (7 dias)',
      value: newThisWeek,
      sub: 'Anúncios recentes',
      icon: TrendingUp,
      color: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-50 dark:bg-violet-900/20',
      border: 'border-violet-100 dark:border-violet-800/30',
      glow: 'shadow-violet-100 dark:shadow-violet-900/20',
    },
    {
      label: 'Pontos de Interesse',
      value: '—',
      sub: 'Escola, Farmácia...',
      icon: MapPin,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      border: 'border-orange-100 dark:border-orange-800/30',
      glow: 'shadow-orange-100 dark:shadow-orange-900/20',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Visão Geral</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Centro de controle do <span className="text-indigo-500 font-semibold">Aluga AI</span>
          </p>
        </div>
        <Link
          href="/dashboard/admin/imoveis/novo"
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 transition-all"
        >
          <Plus size={16} /> Novo Imóvel
        </Link>
      </div>

      {/* F51: KPI Cards com dados reais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className={`bg-white dark:bg-[#111] p-5 rounded-2xl border ${stat.border} shadow-sm hover:shadow-md ${stat.glow} transition-all flex items-start gap-4`}
          >
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} shrink-0`}>
              <stat.icon size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{stat.label}</p>
              <h3 className={`text-2xl font-black mt-0.5 ${stat.color}`}>{stat.value}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions + Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-white/8 p-6">
          <h3 className="text-base font-black mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
            <Building2 size={18} className="text-indigo-500" />
            Acesso Rápido
          </h3>
          <div className="space-y-2.5">
            {[
              { href: '/dashboard/admin/imoveis', title: 'Gerenciador de Imóveis', desc: 'Adicione, edite ou exclua anúncios.' },
              { href: '/dashboard/admin/imoveis/novo', title: '+ Novo Imóvel', desc: 'Cadastrar um novo anúncio agora.' },
              { href: '/dashboard/admin/locais', title: 'Conveniências do Mapa', desc: 'Escolas, Farmácias e Turismo.' },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 dark:border-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 hover:border-indigo-200 dark:hover:border-indigo-800/30 transition-all group"
              >
                <div>
                  <p className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{link.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{link.desc}</p>
                </div>
                <ArrowRight size={16} className="text-gray-400 group-hover:text-indigo-500 transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-white/8 p-6">
          <h3 className="text-base font-black mb-4 flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle size={18} />
            Alertas do Sistema
          </h3>
          <div className="space-y-3">
            <div className="p-4 bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 rounded-xl border border-amber-100 dark:border-amber-500/20">
              <p className="font-bold text-sm">⚡ Upload WebP Ativo</p>
              <p className="text-xs mt-1 opacity-80">Todas as novas imagens são automaticamente comprimidas para WebP. Economia média de 70% no tamanho.</p>
            </div>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
              <p className="font-bold text-sm">✅ Rate Limiting Ativo</p>
              <p className="text-xs mt-1 opacity-80">API de IA protegida com 20 req/min por IP. Banco blindado com rollback atômico de uploads.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
