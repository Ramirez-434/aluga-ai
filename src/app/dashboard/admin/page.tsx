import Link from 'next/link';
import { Building2, MapPin, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { MOCK_PROPERTIES } from '@/data/mockProperties';
import { MOCK_POIS } from '@/data/mockPOIs';

export default function AdminOverview() {
  const stats = [
    { label: 'Imóveis Ativos', value: MOCK_PROPERTIES.length, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Conveniências (POIs)', value: MOCK_POIS.length, icon: MapPin, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { label: 'Leads Hoje', value: 14, icon: Users, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { label: 'Taxa de Conversão', value: '3.2%', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Visão Geral</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Bem-vindo ao centro de controle do Aluga AI.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-[#111] p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm flex items-center gap-4">
            <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
            <Building2 size={20} className="text-primary" /> 
            Acesso Rápido
          </h3>
          <div className="space-y-3">
            <Link href="/dashboard/admin/imoveis" className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">Gerenciador de Imóveis</p>
                <p className="text-sm text-gray-500">Adicione, edite ou exclua anúncios do catálogo.</p>
              </div>
            </Link>
            <Link href="/dashboard/admin/locais" className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">Convenências do Mapa</p>
                <p className="text-sm text-gray-500">Mapeie Escolas, Farmácias e Turismo na cidade.</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-white/10 p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle size={20} /> 
            Alertas do Sistema
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-500/10 text-red-800 dark:text-red-300 rounded-xl border border-red-100 dark:border-red-500/20">
              <p className="font-semibold text-sm">3 Imóveis denunciados</p>
              <p className="text-xs mt-1">Usuários reportaram atividades suspeitas nestes anúncios. Faça a moderação.</p>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-800 dark:text-yellow-300 rounded-xl border border-yellow-100 dark:border-yellow-500/20">
              <p className="font-semibold text-sm">Atualização do IBGE</p>
              <p className="text-xs mt-1">Os marcadores da área de Bela Vista precisam de atualização no sistema de Preço Justo IA.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
